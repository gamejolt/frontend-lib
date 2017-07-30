import Vue from 'vue';
import { Route } from 'vue-router';
import { Store } from 'vuex';
import { PayloadError } from '../../components/payload/payload-service';
import { RouteOptions } from '../../components/route/route-component';

declare module 'vue/types/options' {
	interface ComponentOptions<V extends Vue> {
		__RESOLVER__?: any;
		routeOptions?: RouteOptions & {
			hasResolver?: boolean;
		};
	}
}
