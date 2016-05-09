angular.module( 'gj.Environment' ).provider( 'Environment', function()
{
	var provider = this;

	provider.env = 'production';
	provider.buildType = 'production';
	provider.isClient = typeof global != 'undefined' && typeof process == 'object';
	provider.isMobileApp = !!window.cordova;
	provider.isSecure = window.location.protocol == 'https:';
	provider.isWttf = false;
	provider.isPrerender = window.navigator.userAgent.search( /PhantomJS/ ) !== -1;

	this.$get = function( $animate )
	{
		var Environment = {};

		Environment.env = provider.env;
		Environment.buildType = provider.buildType;
		Environment.isClient = provider.isClient;
		Environment.isMobileApp = provider.isMobileApp;
		Environment.isSecure = provider.isSecure;
		Environment.isWttf = provider.isWttf;
		Environment.isPrerender = provider.isPrerender;

		if ( Environment.env == 'production' ) {
			Environment.baseUrl = 'http://gamejolt.com';

			Environment.wttfBaseUrl = 'http://gamejolt.com';
			Environment.authBaseUrl = 'https://gamejolt.com';
			Environment.checkoutBaseUrl = 'https://gamejolt.com';

			Environment.jamsBaseUrl = 'http://jams.gamejolt.com';
			Environment.jamsIoBaseUrl = 'http://jams.gamejolt.io';
			Environment.firesideBaseUrl = 'http://fireside.gamejolt.com';
			Environment.helpBaseUrl = 'https://help.gamejolt.com';
			Environment.devBaseUrl = 'http://dev.gamejolt.com';
			Environment.gameserverUrl = 'http://gamejolt.net/gameserver';
			Environment.mediaserverUrl = 'https://p5b4y2t6.ssl.hwcdn.net';

			Environment.apiHost = 'https://gamejolt.com';
			Environment.activityStreamHost = 'https://activity.gamejolt.com';
			Environment.chatHost = 'https://chat.gamejolt.com';
			Environment.widgetHost = 'https://widgets.gamejolt.com';
		}
		else if ( Environment.env == 'development' ) {
			Environment.baseUrl = 'http://development.gamejolt.com';

			Environment.wttfBaseUrl = 'http://development.gamejolt.com';
			Environment.authBaseUrl = 'http://development.gamejolt.com';
			Environment.checkoutBaseUrl = 'http://development.gamejolt.com';

			Environment.jamsBaseUrl = 'http://jams.development.gamejolt.com';
			Environment.jamsIoBaseUrl = 'http://jams.development.gamejolt.io';
			Environment.firesideBaseUrl = 'http://fireside.development.gamejolt.com';
			Environment.helpBaseUrl = 'http://help.development.gamejolt.com';
			Environment.devBaseUrl = 'http://dev.development.gamejolt.com';
			Environment.gameserverUrl = 'http://development.gamejolt.net/gameserver';
			Environment.mediaserverUrl = 'http://media.development.gamejolt.com';

			Environment.apiHost = 'http://development.gamejolt.com';
			Environment.activityStreamHost = 'http://activity.development.gamejolt.com';
			Environment.chatHost = 'http://chat.development.gamejolt.com';
			Environment.widgetHost = 'http://localhost:8081';
		}

		if ( Environment.isMobileApp || Environment.isClient ) {

			// When it gets packaged up for production, the URL changes.
			if ( window.location.href.search( /^app\:\/\/game\-jolt\-client\/package\// ) !== -1 ) {
				Environment.wttfBaseUrl = 'app://game-jolt-client/package/index.html#!';
				Environment.authBaseUrl = 'app://game-jolt-client/package/auth.html#!';
				Environment.checkoutBaseUrl = 'app://game-jolt-client/package/checkout.html#!';
			}
			else {
				Environment.wttfBaseUrl = 'app://game-jolt-client/index.html#!';
				Environment.authBaseUrl = 'app://game-jolt-client/auth.html#!';
				Environment.checkoutBaseUrl = 'app://game-jolt-client/checkout.html#!';
			}
		}

		// Turn off animations if we're prerendering.
		if ( Environment.isPrerender ) {
			$animate.enabled( false );
		}

		return Environment;
	};
} );
