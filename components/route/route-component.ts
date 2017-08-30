import Vue from 'vue';
import VueRouter from 'vue-router';
import { Component } from 'vue-property-decorator';
import { createDecorator } from 'vue-class-component';
import { EventBus } from '../event-bus/event-bus.service';
import { objectEquals } from '../../utils/object';
import { HistoryCache } from '../history/cache/cache.service';
import { PayloadError } from '../payload/payload-service';
import { LocationRedirect } from '../../utils/router';
import { arrayRemove } from '../../utils/array';
import { Meta } from '../meta/meta-service';

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
		return RouteResolver.resolvers.findIndex(i => i.componentName === name) !== -1;
	}

	static clearResolvers() {
		this.resolvers = [];
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
					const name = componentOptions.name!;
					const routeOptions = componentOptions.routeOptions || {};

					// The router crawls through each matched route and calls
					// beforeRouteEnter on them one by one. Since we continue to
					// set the leaf route the last one is the only one that will
					// be saved as the leaf.
					setLeafRoute(name);

					// If we have component state from the server for any route
					// components, then we want to instead bootstrap the
					// components from that data. Early out of this function.
					// We'll bootstrap the data through the created() method
					// instead. It will fail the hydration unless we set the
					// data during the created() method.
					if (serverComponentState && serverComponentState[name]) {
						return next();
					}

					let promise: Promise<{ fromCache: boolean; payload: any }> | undefined;
					let hasCache = !!routeOptions.cache ? HistoryCache.has(to, routeOptions.cacheTag) : false;
					const resolver = RouteResolver.startResolve(componentOptions, to);

					if (routeOptions.lazy && !hasCache && !GJ_IS_SSR) {
						promise = getPayload(componentOptions, to, false);
					} else {
						const { payload } = await getPayload(componentOptions, to, !!routeOptions.cache);
						resolver.payload = payload;

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
							const { payload } = await promise;
							resolver.payload = payload;
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

	get routeTitle(): null | string {
		return null;
	}

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

	// Don't allow this to be async. We want it to execute right away.
	created() {
		const name = this.$options.name!;

		if (this.storeName && this.storeModule) {
			this.$store.registerModule(this.storeName, new this.storeModule());
		}

		this.routeInit();

		// For some reason the @Watch decorator was attaching multiple times in
		// very random scenarios.
		this.$watch('$route', (to: any, from: any) => this._onRouteChange(to, from));

		// Set up to watch the route title change.
		if (this.routeTitle) {
			Meta.title = this.routeTitle;
		}

		this.$watch('routeTitle', (title: string | null) => {
			if (title) {
				Meta.title = title;
			}
		});

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
			if (options.hasResolver && !RouteResolver.isComponentResolving(name)) {
				this._reloadRoute(false);
			}
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

	private async _onRouteChange(to: VueRouter.Route, from: VueRouter.Route) {
		const options = this.$options.routeOptions || {};

		// Only do work if the route params/query has actually changed.
		if (this.canSkipRouteUpdate(from, to)) {
			return;
		}

		await this._reloadRoute(!!options.cache);
	}

	private async _reloadRoute(useCache = true) {
		const options = this.$options.routeOptions || {};
		const to = this.$router.currentRoute;

		this.routeInit();

		if (options.hasResolver) {
			const resolver = RouteResolver.startResolve(this.$options, to);
			this.routeLoading = true;

			const { fromCache, payload } = await getPayload(this.$options, to, useCache);
			resolver.payload = payload;

			// If this was resolved from cache, we pass in to refresh the cache.
			await this.resolveRoute(to, resolver, fromCache);
		}
	}

	// Make sure this function isn't an async func. We want to make sure it can
	// do most of its work in the same tick so we can call it in the created()
	// hook after SSR returns data to client.
	resolveRoute(route: VueRouter.Route, resolver: RouteResolver, shouldRefreshCache?: boolean) {
		const routeOptions = this.$options.routeOptions || {};

		// We do a cache refresh if the cache was used for this route.
		if (shouldRefreshCache === undefined) {
			shouldRefreshCache = HistoryCache.has(route, routeOptions.cacheTag);
		}

		// If we are no longer resolving this resolver, let's early out.
		if (!resolver.isValid(this.$route)) {
			return;
		}

		// We want to remove the resolver before we do any of the early returns
		// below, or it may be stuck in the resolvers list forever.
		RouteResolver.removeResolver(resolver);

		// Since this happens async, the component instance may be destroyed
		// already.
		if (this.routeDestroyed) {
			return;
		}

		const payload = resolver.payload;
		if (payload) {
			// If the payload errored out.
			if (payload instanceof PayloadError) {
				if (payload.type === PayloadError.ERROR_NEW_VERSION) {
					// If it was a version change payload error, we want to
					// refresh the page so that it gets the new code.
					window.location.reload();
				}
				return;
			} else if (payload instanceof LocationRedirect) {
				// We want to clear out all current resolvers before doing the
				// redirect. They will re-resolve after the route changes.
				if (GJ_IS_SSR) {
					this.$store.commit('app/redirect', this.$router.resolve(payload.location).href);
				} else {
					RouteResolver.clearResolvers();
					this.$router.replace(payload.location);
				}
				return;
			}

			this.$payload = payload;

			if (routeOptions.cache) {
				HistoryCache.store(route, payload, routeOptions.cacheTag);
			}
		}

		this.routed();
		this.routeLoading = false;
		this.routeBootstrapped = true;

		// Now that we've routed, make sure our title is up to date. We have to
		// do this outside the watcher that we set up in "created()" so that SSR
		// also gets updated.
		if (this.routeTitle) {
			Meta.title = this.routeTitle;
		}

		// We only want to emit the routeChangeAfter event once during a route
		// change. This ensures that we only do it during the leaf node resolve
		// and only if we aren't going to be refreshing cache after this. If we
		// need to refresh cache, it means we'll go through the resolve again
		// after fresh data, so we can just do the emit after that.
		if (isLeafRoute(this.$options.name) && !shouldRefreshCache) {
			EventBus.emit('routeChangeAfter');
		}

		// If we used cache, then we want to refresh the route again async. This
		// allows cache to show really fast but still pull correct and new data
		// from the server.
		if (shouldRefreshCache) {
			return this.refreshCache(route);
		}
	}

	private async refreshCache(route: VueRouter.Route) {
		const resolver = RouteResolver.startResolve(this.$options, route);
		const { payload } = await getPayload(this.$options, route, false);
		resolver.payload = payload;
		await this.resolveRoute(route, resolver, false);
	}

	/**
	 * If all of the previous params are the same, then the already activated
	 * components can stay the same. We only initialize routes that have
	 * probably changed between updates.
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
	useCache: boolean
) {
	const routeOptions = componentOptions.routeOptions || {};

	if (useCache) {
		const cache = HistoryCache.get(route, routeOptions.cacheTag);
		if (cache) {
			return { fromCache: true, payload: cache.data };
		}
	}

	try {
		const payload = await (componentOptions.methods as any).routeResolve(route);
		return { fromCache: false, payload };
	} catch (e) {
		if (e instanceof PayloadError) {
			return { fromCache: false, payload: e };
		}
		throw e;
	}
}
