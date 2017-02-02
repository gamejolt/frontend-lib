import { Component, Inject, Input } from 'ng-metadata/core';
import { StateService } from 'angular-ui-router';
import * as template from '!html-loader!./join.component.html';

import { Connection } from '../../connection/connection-service';
import { Environment } from '../../environment/environment.service';

@Component({
	selector: 'gj-auth-join',
	template,
})
export class AuthJoinComponent
{
	@Input( '<' ) darkVariant = false;

	constructor(
		@Inject( '$state' ) private $state: StateService,
		@Inject( 'Connection' ) public conn: Connection,
		@Inject( 'User_LinkedAccounts' ) private userLinkedAccounts: any,
	)
	{
	}

	/**
	 * Sign up is just login without an account.
	 * It'll direct to the correct page when it figures out if they have an account in the
	 * callback URL.
	 */
	linkedAccountLogin( provider: string )
	{
		this.userLinkedAccounts.login( provider );
	}

	onJoined( formModel: any )
	{
		// We store these so we can log them in automatically once their verification happens.
		// Store it in session so that it can get cleaned up.
		// We only do this on Client because there is no way to eaily go back/refresh in client.
		if ( GJ_IS_CLIENT ) {
			sessionStorage.setItem( 'auth-user', formModel.username );
			sessionStorage.setItem( 'auth-pass', formModel.password );
		}

		// If we're doing this in the auth section, then we can direct through the state.
		// Otherwise we need to do a full refresh over to the page.
		if ( this.$state.includes( 'auth' ) ) {
			this.$state.go( 'auth.join.almost' );
		}
		else {
			window.location.href = Environment.authBaseUrl + '/join/almost';
		}
	}
}
