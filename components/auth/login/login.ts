import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./login.html';
import './login.styl';

import { Connection } from '../../connection/connection-service';
import { makeObservableService } from '../../../utils/vue';
import { AppJolticon } from '../../../vue/components/jolticon/jolticon';
import { AppAuthLoginForm } from './login-form';
import { Auth } from '../auth.service';

@View
@Component({
	components: {
		AppJolticon,
		AppAuthLoginForm,
	},
})
export class AppAuthLogin extends Vue
{
	@Prop( Boolean ) darkVariant?: boolean;

	Connection = makeObservableService( Connection );

	onLoggedIn()
	{
		// if ( this.$stateParams['redirect'] ) {

		// 	// We don't want them to be able to put in an offsite link as the redirect URL.
		// 	// So we only open up certain domains.
		// 	// Otherwise we simply attach it to the main domain.

		// 	// Subdomain redirect: jams.gamejolt.io, fireside.gamejolt.com, etc.
		// 	if ( this.$stateParams['redirect'].search( /^https?:\/\/([a-zA-Z\.]+\.)gamejolt.(com|io)/ ) !== -1 ) {
		// 		window.location.href = this.$stateParams['redirect'];
		// 		return;
		// 	}

		// 	// Normal redirect, within the gamejolt.com domain.
		// 	// Since that's the case, we can set through $location so it doesn't have to reload the scripts.
		// 	window.location.href = Environment.baseUrl + this.$stateParams['redirect'];
		// 	return;
		// }

		Auth.redirectDashboard();
	}

	// linkedAccountLogin( provider: string )
	// {
	// 	// this.userLinkedAccounts.login( provider );
	// }
}
