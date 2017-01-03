import { Component, Inject, Input } from 'ng-metadata/core';
import template from 'html!./login.component.html';

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
		@Inject( '$window' ) private $window: ng.IWindowService,
		@Inject( '$stateParams' ) private $stateParams: ng.ui.IStateParamsService,
		@Inject( 'App' ) private app: App,
		@Inject( 'Environment' ) private env: Environment,
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
				this.$window.location.href = this.$stateParams['redirect'];
				return;
			}

			// Normal redirect, within the gamejolt.com domain.
			// Since that's the case, we can set through $location so it doesn't have to reload the scripts.
			this.$window.location.href = this.env.baseUrl + this.$stateParams['redirect'];
			return;
		}

		this.app.redirectDashboard();
	}

	linkedAccountLogin( provider: string )
	{
		this.userLinkedAccounts.login( provider );
	}
}
