import Vue from 'vue';
import { appStore } from '../../vue/services/app/app-store';
import { Analytics } from '../analytics/analytics.service';

export const AppAuthRequired: Vue.DirectiveOptions = {
	bind( el )
	{
		el.addEventListener( 'click', ( e ) =>
		{
			if ( appStore.state!.user ) {
				return;
			}

			// Stop everything.
			e.stopPropagation();
			e.stopImmediatePropagation();
			e.preventDefault();

			// TODO
			console.log( 'show modal!' );
			Analytics.trackEvent( 'auth-required-modal', 'shown' );
		} );
	},
};
