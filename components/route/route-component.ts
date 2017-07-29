import Vue from 'vue';
import VueRouter from 'vue-router';
import { Watch, Component } from 'vue-property-decorator';
import { createDecorator } from 'vue-class-component';
import { EventBus } from '../event-bus/event-bus.service';
import { objectEquals } from '../../utils/object';
import { HistoryCache } from '../history/cache/cache.service';
import { PayloadError } from '../payload/payload-service';
import { LocationRedirect } from '../../utils/router';
import { arrayRemove } from '../../utils/array';

// This is component state that the server may have returned to the browser. It
// can be used to bootstrap components with initial data.
const serverComponentState =
	typeof window !== 'undefined' && window.__INITIAL_STATE__ && window.__INITIAL_STATE__.components;

export interface RouteOptions {
	lazy?: boolean;
	cache?: boolean;
	cacheTag?: string;
}

class RouteResolver {
	private static resolvers: RouteResolver[] = [];

	payload: any | PayloadError | LocationRedirect;

	constructor(public componentName: string, public route: VueRouter.Route) {}

	isValid(currentRoute: VueRouter.Route) {
		return RouteResolver.resolvers.indexOf(this) !== -1 && this.route === currentRoute;
	}

	static startResolve(componentOptions: Vue.ComponentOptions<Vue>, to: VueRouter.Route) {
		const resolver = new RouteResolver(componentOptions.name!, to);
		RouteResolver.resolvers.push(resolver);
		return resolver;
	}

	static removeResolver(resolver: RouteResolver) {
		arrayRemove(RouteResolver.resolvers, i => i === resolver);
	}

	static isComponentResolving(name: string) {
		return RouteResolver.resolvers.findIndex(i => i.componentName === name) === -1;
	}
}

export function RouteResolve(options: RouteOptions = {}) {
	return createDecorator((componentOptions: Vue.ComponentOptions<Vue>, key: string) => {
		if (key !== 'routeResolve') {
			throw new Error(`Decorated route resolve function must be called "routeResolve".`);
		}

		// Store the options passed in.
		componentOptions.routeOptions = {
			...options,
			hasResolver: true,
		};

		// Mixin a beforeRouteEnter method and funnel it off to our static
		// method. We need to do it this way since we need access to the
		// componentOptions.
		componentOptions.mixins = componentOptions.mixins || [];
		componentOptions.mixins.push(
			{
				// This will get called by the browser and server. We call their
				// annotated function for fetching the data for the route.
				async beforeRouteEnter(
					to: VueRouter.Route,
					_from: VueRouter.Route,
					next: (to?: VueRouter.RawLocation | false | ((vm: Vue) => any) | void) => void
				) {
					const routeOptions = componentOptions.routeOptions || {};

					// The router crawls through each matched route and calls
					// beforeRouteEnter on them one by one. Since we continue to
					// set the leaf route the last one is the only one that will
					// be saved as the leaf.
					setLeafRoute(componentOptions.name);

					// If we have component state from the server for any route
					// components, then we want to instead bootstrap the
					// components from that data. Early out of this function.
					// We'll bootstrap the data through the created() method
					// instead. It will fail the hydration unless we set the
					// data during the created() method.
					if (serverComponentState[componentOptions.name!]) {
						console.log('skip payload fetch since we have state');
						return next();
					}

					let promise: Promise<any> | undefined;
					let hasCache = routeOptions.cache ? HistoryCache.has(to, routeOptions.cacheTag) : false;
					const resolver = RouteResolver.startResolve(componentOptions, to);

					if (routeOptions.lazy && !hasCache && !GJ_IS_SSR) {
						promise = getPayload(componentOptions, to);
					} else {
						resolver.payload = await getPayload(componentOptions, to, routeOptions.cache);

						// For server next() doesn't call, so we have to pull
						// this data within the created() hook. We also need
						// this data within the server.js file. We can pull from
						// all server locations from this options. Kind of
						// hacky, though.
						if (GJ_IS_SSR) {
							componentOptions.__RESOLVER__ = resolver;
						}
					}

					next(async (vm: BaseRouteComponent) => {
						// SSR still calls next() but won't re-render the route
						// component, so it's pointless to do things here.
						// Instead we do it in the component created() func.
						if (GJ_IS_SSR) {
							return;
						}

						if (promise) {
							vm.routeLoading = true;
							resolver.payload = await promise;
						}

						await vm.resolveRoute(to, resolver);
					});
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
	routeInit(): void {}

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
		const name = this.$options.name!;

		if (this.storeName && this.storeModule) {
			this.$store.registerModule(this.storeName, new this.storeModule());
		}

		this.routeInit();

		if (GJ_IS_SSR) {
			// In SSR we have to store the resolver for each route component
			// somewhere. Since we don't have an instance we instead put it into
			// the component's static options. Yay for hacks! Let's use it and
			// resolve it here.
			if (this.$options.__RESOLVER__) {
				this.resolveRoute(this.$route, this.$options.__RESOLVER__);
			}
		} else if (serverComponentState && serverComponentState[name]) {
			// If we are in a browser context, the server may have set initial
			// state for the routed components. If this is the case we want to
			// pull it into the component options so it can bootstrap fast.
			const resolver = RouteResolver.startResolve(this.$options, this.$route);
			resolver.payload = serverComponentState[name];
			serverComponentState[name] = undefined;

			// Make sure we don't refresh cache.
			this.resolveRoute(this.$route, resolver, false);
		} else {
			// If this route component wasn't in the DOM (v-if maybe?) when the
			// route changed, then it won't trigger the resolve flow. We have to
			// manually trigger the resolve in this case.
			const options = this.$options.routeOptions || {};
			if (options.hasResolver && RouteResolver.isComponentResolving(name)) {
				this._reloadRoute(false);
			}
		}
	}

	@Watch('$route')
	async _onRouteChange(to: VueRouter.Route, from: VueRouter.Route) {
		const options = this.$options.routeOptions || {};

		// Only do work if the route params/query has actually changed.
		if (this.canSkipRouteUpdate(from, to)) {
			return;
		}

		await this._reloadRoute(options.cache);

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

	reloadRoute() {
		return this._reloadRoute(false);
	}

	private async _reloadRoute(useCache = true) {
		const options = this.$options.routeOptions || {};
		const to = this.$router.currentRoute;

		this.routeInit();

		if (options.hasResolver) {
			const resolver = RouteResolver.startResolve(this.$options, to);
			this.routeLoading = true;
			resolver.payload = await getPayload(this.$options, to, useCache);
			await this.resolveRoute(to, resolver, useCache);
		}
	}

	// Make sure this function it's an async func. We want to make sure it can
	// do most of its work in the same tick so we can call it in the created()
	// hook after SSR returns data to client.
	resolveRoute(route: VueRouter.Route, resolver: RouteResolver, shouldRefreshCache?: boolean) {
		const routeOptions = this.$options.routeOptions || {};

		// We do a cache refresh if the cache was used for this route.
		if (shouldRefreshCache === undefined) {
			shouldRefreshCache = HistoryCache.has(route, routeOptions.cacheTag);
		}

		// Since this happens async, the component instance may be destroyed
		// already.
		if (!resolver.isValid(this.$route) || this.routeDestroyed) {
			return;
		}

		const payload = resolver.payload;
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
				return this.$router.replace(payload.location);
			}

			this.$payload = payload;

			if (routeOptions.cache) {
				HistoryCache.store(route, payload, routeOptions.cacheTag);
			}
		}

		this.routed();
		this.routeLoading = false;
		this.routeBootstrapped = true;

		if (isLeafRoute(this.$options.name)) {
			EventBus.emit('routeChangeAfter');
		}

		RouteResolver.removeResolver(resolver);

		// If we used cache, then we want to refresh the route again async. This
		// allows cache to show really fast but still pull correct and new data from
		// the server.
		if (shouldRefreshCache) {
			return this.refreshCache(route);
		}
	}

	private async refreshCache(route: VueRouter.Route) {
		const _resolver = RouteResolver.startResolve(this.$options, route);
		_resolver.payload = await getPayload(this.$options, route);
		await this.resolveRoute(route, _resolver, false);
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
