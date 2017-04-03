import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./join.html';
import './join.styl';

import { Connection } from '../../connection/connection-service';
import { makeObservableService } from '../../../utils/vue';
import { AppJolticon } from '../../../vue/components/jolticon/jolticon';
import { AppAuthJoinForm } from './join-form';
import { Environment } from '../../environment/environment.service';

@View
@Component({
	components: {
		AppJolticon,
		AppAuthJoinForm,
	}
})
export class AppAuthJoin extends Vue
{
	@Prop( Boolean ) darkVariant?: boolean;
	@Prop( Boolean ) shouldRedirect?: boolean;

	Connection = makeObservableService( Connection );

	/**
	 * Sign up is just login without an account. It'll direct to the correct
	 * page when it figures out if they have an account in the callback URL.
	 */
	linkedAccountLogin( provider: string )
	{
		// this.userLinkedAccounts.login( provider );
	}

	onJoined( formModel: any )
	{
		this.$emit( 'joined', formModel );

		if ( this.shouldRedirect ) {
			window.location.href = Environment.authBaseUrl + '/join/almost';
		}
	}
}

// @Component({
// 	selector: 'gj-auth-join',
// 	template,
// })
// export class AuthJoinComponent
// {
// 	@Input( '<' ) darkVariant = false;

// 	conn = Connection;

// 	constructor(
// 		@Inject( '$state' ) private $state: StateService,
// 		@Inject( 'User_LinkedAccounts' ) private userLinkedAccounts: any,
// 	)
// 	{
// 	}

// 	/**
// 	 * Sign up is just login without an account.
// 	 * It'll direct to the correct page when it figures out if they have an account in the
// 	 * callback URL.
// 	 */
// 	linkedAccountLogin( provider: string )
// 	{
// 		this.userLinkedAccounts.login( provider );
// 	}

// 	onJoined( formModel: any )
// 	{
// 		// We store these so we can log them in automatically once their verification happens.
// 		// Store it in session so that it can get cleaned up.
// 		// We only do this on Client because there is no way to eaily go back/refresh in client.
// 		if ( GJ_IS_CLIENT ) {
// 			sessionStorage.setItem( 'auth-user', formModel.username );
// 			sessionStorage.setItem( 'auth-pass', formModel.password );
// 		}

// 		// If we're doing this in the auth section, then we can direct through the state.
// 		// Otherwise we need to do a full refresh over to the page.
// 		if ( this.$state.includes( 'auth' ) ) {
// 			this.$state.go( 'auth.join.almost' );
// 		}
// 		else {
// 			window.location.href = Environment.authBaseUrl + '/join/almost';
// 		}
// 	}
// }
