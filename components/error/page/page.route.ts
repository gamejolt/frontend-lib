import Vue from 'vue';
import VueRouter from 'vue-router';
import { Component } from 'vue-property-decorator';
import { AppStore, AppMutation } from '../../../vue/services/app/app-store';

// Just a placeholder that sets the 404 error state.
@Component({})
export class RouteError404 extends Vue {
	@AppMutation setError: AppStore['setError'];

	created() {
		this.setError(404);
	}

	render(h: Vue.CreateElement) {
		return h('div');
	}
}

export const routeError404: VueRouter.RouteConfig = {
	name: 'error.404',
	path: '*',
	component: RouteError404,
};
