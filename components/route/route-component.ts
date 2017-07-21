import Vue from 'vue';
import VueRouter from 'vue-router';
import { Watch, Component } from 'vue-property-decorator';
import { createDecorator } from 'vue-class-component';
import { EventBus } from '../event-bus/event-bus.service';
import { objectEquals } from '../../utils/object';
import { HistoryCache } from '../history/cache/cache.service';
import { PayloadError } from '../payload/payload-service';
import { LocationRedirect } from '../../utils/router';

// This is component state that the server may have returned to the browser. It
// can be used to bootstrap components with initial data.
const state =
	typeof window !== 'undefined' &&
	(window as any).__INITIAL_STATE__ &&
	(window as any).__INITIAL_STATE__.components;

export interface RouteOptions {
	lazy?: boolean;
	cache?: boolean;
	cacheTag?: string;
}

export function RouteResolve(options: RouteOptions = {}) {
	return createDecorator((componentOptions: Vue.ComponentOptions<Vue>, key: string) => {
		if (key !== 'routeResolve') {
			throw new Error(`Decorated route resolve function must be called "routeResolve".`);
		}

		// Store the options passed in.
		componentOptions.routeOptions = options;

		// Mixin a beforeRouteEnter method and funnel it off to our static
		// method. We need to do it this way since we need access to the
		// componentOptions.
		componentOptions.mixins = componentOptions.mixins || [];
		componentOptions.mixins.push(
			{
				async beforeRouteEnter(to, from, next) {
					beforeRouteEnter(to, from, next, componentOptions);
				},
			} as Vue.ComponentOptions<Vue>
		);
	});
}

@Component({})
export class BaseRouteComponent extends Vue {
	$payload: any;
	routeDestroyed = false;
	routeLoading = false;
	routeBootstrapped = false;

	storeName?: string;
	storeModule?: any;

	async routeResolve(this: undefined, _route: VueRouter.Route): Promise<any> {}

	/**
	 * Called to initialize the route either at the first route to this
	 * component or after the $route object changes.
	 */
	routeInit(): Promise<any> | void {}

	/**
	 * Called after routeResolve resolves with data. `$payload` will be set with
	 * whatever was resolved.
	 */
	routed() {}

	/**
	 * Called when the route component is completely destroyed.
	 */
	routeDestroy() {}

	async created() {
		if (this.storeName && this.storeModule) {
			this.$store.registerModule(this.storeName, new this.storeModule());
		}

		await this.routeInit();

		// If we are in a browser context, the server may have set initial state
		// for the routed components. If this is the case we want to pull it
		// into the component options so it can bootstrap fast.
		if (!GJ_IS_SSR && state) {
			const matched = this.$router.getMatchedComponents();
			if (matched.length) {
				matched.forEach((component: Vue.ComponentOptions<Vue>, i) => {
					component.__INITIAL_STATE__ = state[i];
					(window as any).__INITIAL_STATE__.components[i] = null;
				});
			}
		}

		// DISABLED ON BROWSER FOR NOW
		// We run this on browser and server. When it's on the server the route
		// enter hook has populated the initial data and now we want to call the
		// routed() method. When it's browser we may have gotten initial state
		// from the server and are now bootstrapping our component with it.
		const constructor = this.constructor as any;
		if (constructor.extendOptions && constructor.extendOptions.__INITIAL_STATE__ && GJ_IS_SSR) {
			finalizeRoute(this.$options, this.$route, this, constructor.extendOptions.__INITIAL_STATE__);
		}
	}

	@Watch('$route')
	async _onRouteChange(to: VueRouter.Route, from: VueRouter.Route) {
		const options = this.$options.routeOptions || {};

		// Only do work if the route params/query has actually changed.
		if (this.canSkipRouteUpdate(from, to)) {
			return;
		}

		this._reloadRoute(options.cache);

		if (isLeafRoute(this.$options.name)) {
			EventBus.emit('routeChangeAfter');
		}
	}

	destroyed() {
		if (this.storeName) {
			this.$store.unregisterModule(this.storeName);
		}
		this.routeDestroyed = true;
		this.routeDestroy();
	}

	async reloadRoute() {
		this._reloadRoute(false);
	}

	private async _reloadRoute(useCache = true) {
		await this.routeInit();
		this.routeLoading = true;
		const payload = await getPayload(this.$options, this.$router.currentRoute, useCache);
		await finalizeRoute(this.$options, this.$router.currentRoute, this, payload, useCache);
	}

	/**
	 * If all of the previous params are the same, then the already activated
	 * components can stay the same. We only initialize routes that have probably
	 * changed between updates.
	 */
	private canSkipRouteUpdate(from: VueRouter.Route, to: VueRouter.Route) {
		// TODO: We can probably try to be smarter about this in the future and
		// only update if params that affect the route have changed.
		return objectEquals(to.params, from.params) && objectEquals(to.query, from.query);
	}
}

let leafRoute: string | undefined;
function setLeafRoute(name?: string) {
	leafRoute = name;
}

// The leaf route is the last in the hierarchy of routes. We only want to
// trigger the route change after this one has resolved, otherwise we end up
// triggering many routeChangeAfter events.
function isLeafRoute(name?: string) {
	return leafRoute === name;
}

// This will get called by the browser and server. We call their annotated
// function for fetching the data for the route.
async function beforeRouteEnter(
	to: VueRouter.Route,
	_from: VueRouter.Route,
	next: (to?: VueRouter.RawLocation | false | ((vm: Vue) => any) | void) => void,
	componentOptions: Vue.ComponentOptions<Vue>
) {
	const routeOptions = componentOptions.routeOptions || {};

	// The router crawls through each matched route and calls beforeRouteEnter
	// on them one by one. Since we continue to set the leaf route the last one
	// is the only one that will be saved as the leaf.
	setLeafRoute(componentOptions.name);

	let promise: Promise<any> | undefined;
	let payload: any;
	let hasCache = routeOptions.cache ? HistoryCache.has(to, routeOptions.cacheTag) : false;

	// If we have component state from the server for any route components, then
	// we want to instead bootstrap the components from that data. Early out of
	// this function. We'll bootstrap the data through the created() method
	// instead.
	if (state) {
		payload = null;
	} else if (routeOptions.lazy && !hasCache && !GJ_IS_SSR) {
		promise = getPayload(componentOptions, to);
	} else {
		payload = await getPayload(componentOptions, to, routeOptions.cache);

		// We store the payload on the component options. For browser we get
		// loaded within the next() call below. For server next() doesn't call,
		// so we have to pull this data within the created() hook. We also need
		// this data within the server.js file. We can pull from all server
		// locations from this options. Kind of hacky, though.
		if (GJ_IS_SSR) {
			componentOptions.__INITIAL_STATE__ = payload;
		}
	}

	next(async (vm: BaseRouteComponent) => {
		vm.routeLoading = true;
		if (promise) {
			payload = await promise;
		}

		await finalizeRoute(componentOptions, to, vm, payload);

		if (isLeafRoute(componentOptions.name)) {
			EventBus.emit('routeChangeAfter');
		}
	});
}

/**
 * This will call the function to get the payload. It will return a promise that
 * will resolve with the data. If we are caching, then we will try to return the
 * cache data.
 */
async function getPayload(
	componentOptions: Vue.ComponentOptions<Vue>,
	route: VueRouter.Route,
	useCache = false
) {
	const routeOptions = componentOptions.routeOptions || {};

	if (useCache) {
		const cache = HistoryCache.get(route, routeOptions.cacheTag);
		if (cache) {
			return cache.data;
		}
	}

	try {
		return await (componentOptions.methods as any).routeResolve(route);
	} catch (e) {
		if (e instanceof PayloadError) {
			return e;
		}
		throw e;
	}
}

async function finalizeRoute(
	componentOptions: Vue.ComponentOptions<Vue>,
	route: VueRouter.Route,
	vm: BaseRouteComponent,
	payload: any | PayloadError,
	shouldRefreshCache?: boolean
) {
	const routeOptions = componentOptions.routeOptions || {};

	// We do a cache refresh if the cache was used for this route.
	if (shouldRefreshCache === undefined) {
		shouldRefreshCache = HistoryCache.has(route, routeOptions.cacheTag);
	}

	// Since this happens async, the component instance may be destroyed
	// already.
	if (vm.routeDestroyed) {
		return;
	}

	if (payload) {
		// If the payload errored out.
		if (payload instanceof PayloadError) {
			if (payload.type === PayloadError.ERROR_NEW_VERSION) {
				// If it was a version change payload error, we want to refresh
				// the page so that it gets the new code.
				window.location.reload();
				return;
			}

			// TODO(rewrite): Is this needed anymore or does payload service
			// handle just fine?
			// if (vm.routeError) {
			// 	vm.routeError(payload);
			// }

			return;
		} else if (payload instanceof LocationRedirect) {
			return vm.$router.replace(payload.location);
		}

		vm.$payload = payload;

		if (routeOptions.cache) {
			HistoryCache.store(route, payload, routeOptions.cacheTag);
		}
	}

	vm.routed();
	vm.routeLoading = false;
	vm.routeBootstrapped = true;

	// If we used cache, then we want to refresh the route again async. This
	// allows cache to show really fast but still pull correct and new data from
	// the server.
	if (shouldRefreshCache) {
		payload = await getPayload(componentOptions, route);
		finalizeRoute(componentOptions, route, vm, payload, false);
	}
}
