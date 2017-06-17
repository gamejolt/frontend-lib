import Vue from 'vue';
import VueRouter from 'vue-router';
import { createDecorator } from 'vue-class-component';
import { HistoryCache } from '../components/history/cache/cache.service';
import { PayloadError } from '../components/payload/payload-service';
import { EventBus } from '../components/event-bus/event-bus.service';

interface BeforeRouteEnterOptions {
	lazy?: boolean;
	cache?: boolean;
	cacheTag?: string;
}

export function BeforeRouteEnter(options: BeforeRouteEnterOptions = {}) {
	return createDecorator(
		(componentOptions: Vue.ComponentOptions<Vue>, key: string) => {
			// This is component state that the server may have returned to the
			// browser. It can be used to bootstrap components with initial data.
			const state =
				typeof window !== 'undefined' &&
				(window as any).__INITIAL_STATE__ &&
				(window as any).__INITIAL_STATE__.components;

			/**
		 * This will call the function to get the payload.
		 * It will return a promise that will resolve with the data.
		 * If we are caching, then we will try to return the cache data.
		 */
			async function getPayload(route: VueRouter.Route, useCache = false) {
				if (useCache) {
					const cache = HistoryCache.get(route, options.cacheTag);
					if (cache) {
						return cache.data;
					}
				}

				try {
					return await (componentOptions.methods as any)[key](route);
				} catch (e) {
					if (e instanceof PayloadError) {
						return e;
					}
					throw e;
				}
			}

			async function finalizeRoute(
				route: VueRouter.Route,
				vm: Vue,
				payload: any | PayloadError,
				shouldRefreshCache?: boolean,
			) {
				// We do a cache refresh if the cache was used for this route.
				if (shouldRefreshCache === undefined) {
					shouldRefreshCache = HistoryCache.has(route, options.cacheTag);
				}

				// Since this happens async, the component instance may be destroyed
				// already.
				if (vm.routeDestroyed) {
					return;
				}

				if (payload) {
					// If the payload errored out.
					if (payload instanceof PayloadError) {
						// If it was a version change payload error, we want to
						// refresh the page so that it gets the new code.
						if (payload.type === PayloadError.ERROR_NEW_VERSION) {
							window.location.reload();
							return;
						}

						if (vm.routeError) {
							vm.routeError(payload);
						}

						return;
					}

					vm.$payload = payload;

					if (options.cache) {
						HistoryCache.store(route, payload, options.cacheTag);
					}
				}

				if (vm.routed) {
					vm.routed();
				}

				vm.routeLoading = false;
				vm.routeBootstrapped = true;

				// If we used cache, then we want to refresh the route again async.
				// This allows cache to show really fast but still pull correct and
				// new data from the server.
				if (shouldRefreshCache) {
					payload = await getPayload(route);
					finalizeRoute(route, vm, payload, false);
				}
			}

			// We do everything as a mixin so that we don't override their calls.
			componentOptions.mixins = componentOptions.mixins || [];
			componentOptions.mixins.push(
				{
					data() {
						return {
							routeDestroyed: false,
							routeLoading: false,
							routeBootstrapped: false,
						};
					},

					// This will get called by the browser and server. We call their
					// annotated function for fetching the data for the route.
					async beforeRouteEnter(to, _from, next) {
						EventBus.emit('routeChangeBefore', to);

						let promise: Promise<any> | undefined;
						let payload: any;
						let hasCache = options.cache
							? HistoryCache.has(to, options.cacheTag)
							: false;

						// If we have component state from the server for any route
						// components, then we want to instead bootstrap the components
						// from that data. Early out of this function. We'll bootstrap
						// the data through the created() method instead.
						if (state) {
							payload = null;
						} else if (options.lazy && !hasCache && !GJ_IS_SSR) {
							promise = getPayload(to);
						} else {
							payload = await getPayload(to, options.cache);

							// We store the payload on the component options. For
							// browser we get loaded within the next() call below. For
							// server next() doesn't call, so we have to pull this data
							// within the created() hook. We also need this data within
							// the server.js file. We can pull from all server locations
							// from this options. Kind of hacky, though.
							if (GJ_IS_SSR) {
								componentOptions.__INITIAL_STATE__ = payload;
							}
						}

						next(async (vm: Vue) => {
							vm.routeLoading = true;
							if (promise) {
								payload = await promise;
							}

							await finalizeRoute(to, vm, payload);
							EventBus.emit('routeChangeAfter');
						});
					},

					// In the browser, for when the component stays the same but the
					// route changes. We basically have to duplicate the above.
					watch: {
						$route: async function routeChanged(
							this: Vue,
							route: VueRouter.Route,
						) {
							EventBus.emit('routeChangeBefore');
							this.routeLoading = true;
							const payload = await getPayload(route, options.cache);
							await finalizeRoute(route, this, payload);
							EventBus.emit('routeChangeAfter');
						},
					},

					// This gets called both in the server and the browser.
					created() {
						// If we are in a browser context, the server may have set
						// initial state for the routed components. If this is the case
						// we want to pull it into the component options so it can
						// bootstrap fast.
						if (!GJ_IS_SSR && state) {
							const matched = this.$router.getMatchedComponents();
							if (matched.length) {
								matched.forEach((component: Vue.ComponentOptions<Vue>, i) => {
									component.__INITIAL_STATE__ = state[i];
									(window as any).__INITIAL_STATE__.components[i] = null;
								});
							}
						}

						// We run this on browser and server. When it's on the server
						// the route enter hook has populated the initial data and now
						// we want to call the routed() method. When it's browser we may
						// have gotten initial state from the server and are now
						// bootstrapping our component with it.
						const constructor = this.constructor as any;
						if (
							constructor.extendOptions &&
							constructor.extendOptions.__INITIAL_STATE__
						) {
							finalizeRoute(
								this.$route,
								this,
								constructor.extendOptions.__INITIAL_STATE__,
							);
						}
					},

					destroyed() {
						this.routeDestroyed = true;
					},
				} as Vue.ComponentOptions<Vue>,
			);
		},
	);
}
