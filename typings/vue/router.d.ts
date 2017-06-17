import Vue from 'vue';
import { Route } from 'vue-router';
import { Store } from 'vuex';
import { PayloadError } from '../../components/payload/payload-service';

declare module 'vue/types/options' {
	interface ComponentOptions<V extends Vue> {
		__INITIAL_STATE__?: any;
	}
}

declare module 'vue/types/vue' {
	interface Vue {
		$payload: any;
		routeDestroyed: boolean;
		routeLoading: boolean;
		routeBootstrapped: boolean;
		routed?(): void;
		routeError?(PayloadError): void;
	}
}
