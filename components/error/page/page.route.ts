import Vue from 'vue';
import VueRouter from 'vue-router';
import { Component } from 'vue-property-decorator';
import { AppState } from '../../../vue/services/app/app-store';

// Just a placeholder that sets the 404 error state.
@Component({})
class RouteError404 extends Vue
{
	created()
	{
		this.$store.commit( AppState.Mutations.setError, 404 );
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
