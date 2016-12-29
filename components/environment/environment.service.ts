import { Injectable } from '@angular/core';

@Injectable()
export class Environment
{
	env: 'production' | 'development' = GJ_ENVIRONMENT;
	buildType: 'production' | 'development' = GJ_BUILD_TYPE;
	isClient = typeof global !== 'undefined' && typeof process === 'object';
	isSecure = window && window.location.protocol === 'https:';
	isPrerender = window && window.navigator.userAgent.search( /PhantomJS/ ) !== -1;

	// Production defaults.
	baseUrl = 'http://gamejolt.com';
	secureBaseUrl = 'https://gamejolt.com';

	wttfBaseUrl = 'http://gamejolt.com';
	authBaseUrl = 'https://gamejolt.com';
	checkoutBaseUrl = 'https://gamejolt.com';

	jamsBaseUrl = 'http://jams.gamejolt.com';
	jamsIoBaseUrl = 'http://jams.gamejolt.io';
	firesideBaseUrl = 'http://fireside.gamejolt.com';
	helpBaseUrl = 'https://help.gamejolt.com';
	devBaseUrl = 'http://dev.gamejolt.com';
	gameserverUrl = 'http://gamejolt.net/gameserver';
	mediaserverUrl = 'https://p5b4y2t6.ssl.hwcdn.net';

	apiHost = 'https://gamejolt.com';
	activityStreamHost = 'https://activity.gamejolt.com';
	chatHost = 'https://chat.gamejolt.com';
	widgetHost = 'https://widgets.gamejolt.com';

	constructor()
	{
		if ( this.env === 'development' ) {
			this.baseUrl = 'http://development.gamejolt.com';
			this.secureBaseUrl = 'http://development.gamejolt.com';

			this.wttfBaseUrl = 'http://development.gamejolt.com';
			this.authBaseUrl = 'http://development.gamejolt.com';
			this.checkoutBaseUrl = 'http://development.gamejolt.com';

			this.jamsBaseUrl = 'http://jams.development.gamejolt.com';
			this.jamsIoBaseUrl = 'http://jams.development.gamejolt.io';
			this.firesideBaseUrl = 'http://fireside.development.gamejolt.com';
			this.helpBaseUrl = 'http://help.development.gamejolt.com';
			this.devBaseUrl = 'http://dev.development.gamejolt.com';
			this.gameserverUrl = 'http://development.gamejolt.net/gameserver';
			this.mediaserverUrl = 'http://media.development.gamejolt.com';

			this.apiHost = 'http://development.gamejolt.com';
			this.activityStreamHost = 'http://activity.development.gamejolt.com';
			this.chatHost = 'http://chat.development.gamejolt.com';
			this.widgetHost = 'http://localhost:8081';
		}

		if ( this.isClient ) {

			// When it gets packaged up for production, the URL changes.
			if ( window.location.href.search( /^app\:\/\/game\-jolt\-client\/package\// ) !== -1 ) {
				this.wttfBaseUrl = 'app://game-jolt-client/package/index.html#!';
				this.authBaseUrl = 'app://game-jolt-client/package/auth.html#!';
				this.checkoutBaseUrl = 'app://game-jolt-client/package/checkout.html#!';
			}
			else {
				this.wttfBaseUrl = 'app://game-jolt-client/index.html#!';
				this.authBaseUrl = 'app://game-jolt-client/auth.html#!';
				this.checkoutBaseUrl = 'app://game-jolt-client/checkout.html#!';
			}
		}

		// Turn off animations if we're prerendering.
		if ( this.isPrerender ) {
			// TODO: Figure this out for angular2
			// $animate.enabled( false );
		}
	}
}
