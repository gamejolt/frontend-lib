import {
	RouteResolverOptions,
	RouteStoreResolveCallback,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { RouteStoreOptions } from 'game-jolt-frontend-lib/components/route/route-store';
import Vue from 'vue';

declare module 'vue/types/options' {
	interface ComponentOptions<V extends Vue> {
		__RESOLVER__?: any;
		routeResolverOptions?: RouteResolverOptions & {
			hasResolver?: boolean;
			resolveStore?: RouteStoreResolveCallback;
		};
		routeStoreOptions?: RouteStoreOptions;
	}
}
