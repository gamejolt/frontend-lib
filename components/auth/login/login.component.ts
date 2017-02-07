import { Component, Inject, Input } from 'ng-metadata/core';
import { StateParams } from 'angular-ui-router';
import * as template from '!html-loader!./login.component.html';

import { App } from '../../../../../auth/app-service';
import { Connection } from '../../connection/connection-service';
import { Environment } from '../../environment/environment.service';

@Component({
	selector: 'gj-auth-login',
	template,
})
export class AuthLoginComponent
{
	@Input( '<' ) darkVariant = false;

	constructor(
		@Inject( '$stateParams' ) private $stateParams: StateParams,
		@Inject( 'App' ) private app: App,
		@Inject( 'Connection' ) public conn: Connection,
		@Inject( 'User_LinkedAccounts' ) private userLinkedAccounts: any,
	)
	{
	}

	onLoggedIn()
	{
		if ( this.$stateParams['redirect'] ) {

			// We don't want them to be able to put in an offsite link as the redirect URL.
			// So we only open up certain domains.
			// Otherwise we simply attach it to the main domain.

			// Subdomain redirect: jams.gamejolt.io, fireside.gamejolt.com, etc.
			if ( this.$stateParams['redirect'].search( /^https?:\/\/([a-zA-Z\.]+\.)gamejolt.(com|io)/ ) !== -1 ) {
				window.location.href = this.$stateParams['redirect'];
				return;
			}

			// Normal redirect, within the gamejolt.com domain.
			// Since that's the case, we can set through $location so it doesn't have to reload the scripts.
			window.location.href = Environment.baseUrl + this.$stateParams['redirect'];
			return;
		}

		this.app.redirectDashboard();
	}

	linkedAccountLogin( provider: string )
	{
		this.userLinkedAccounts.login( provider );
	}
}
