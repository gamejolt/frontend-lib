import Vue from 'vue';
import VueRouter from 'vue-router';
import { Component } from 'vue-property-decorator';
import { AppStore, AppMutation } from '../../../vue/services/app/app-store';

// Just a placeholder that sets the 404 error state.
@Component({})
class RouteError404 extends Vue
{
	@AppMutation setError: AppStore['setError'];

	created()
	{
		this.setError( 404 );
	}

	render( h: Vue.CreateElement )
	{
		return h( 'div' );
	}
}

export const routeError404: VueRouter.RouteConfig = {
	path: '*',
	component: RouteError404,
};
