export const isClient = GJ_IS_CLIENT;
export const isSecure =
	typeof window !== 'undefined' && window.location.protocol === 'https:';
export const isPrerender =
	typeof window !== 'undefined' &&
	window.navigator.userAgent.search(/PhantomJS/) !== -1;

export class Environment {
	static env: 'production' | 'development' = GJ_ENVIRONMENT;
	static buildType: 'production' | 'development' = GJ_BUILD_TYPE;
	static isClient = GJ_IS_CLIENT;
	static isSecure = isSecure;
	static isPrerender = isPrerender;

	// Production defaults.
	static baseUrl = 'http://gamejolt.com';
	static secureBaseUrl = 'https://gamejolt.com';

	static wttfBaseUrl = 'http://gamejolt.com';
	static authBaseUrl = 'https://gamejolt.com';
	static checkoutBaseUrl = 'https://gamejolt.com';

	static jamsBaseUrl = 'http://jams.gamejolt.com';
	static jamsIoBaseUrl = 'http://jams.gamejolt.io';
	static firesideBaseUrl = 'http://fireside.gamejolt.com';
	static helpBaseUrl = 'https://help.gamejolt.com';
	static devBaseUrl = 'http://dev.gamejolt.com';
	static gameserverUrl = (isSecure ? 'https' : 'http') + '://gamejolt.net';
	static mediaserverUrl = 'https://m.gjcdn.net';

	static apiHost = 'https://gamejolt.com';
	static gameserverApiHost = 'https://gamejolt.net';
	static activityStreamHost = 'https://activity.gamejolt.com';
	static chatHost = 'https://chat.gamejolt.com';
	static widgetHost = 'https://widgets.gamejolt.com';
}

if (Environment.env === 'development') {
	Environment.baseUrl = 'http://localhost:8080';
	Environment.secureBaseUrl = 'http://localhost:8080';

	Environment.wttfBaseUrl = 'http://localhost:8080';
	Environment.authBaseUrl = 'http://localhost:8080';
	Environment.checkoutBaseUrl = 'http://localhost:8080';

	Environment.jamsBaseUrl = 'http://jams.development.gamejolt.com';
	Environment.jamsIoBaseUrl = 'http://jams.development.gamejolt.io';
	Environment.firesideBaseUrl = 'http://fireside.development.gamejolt.com';
	Environment.helpBaseUrl = 'http://help.development.gamejolt.com';
	Environment.devBaseUrl = 'http://dev.development.gamejolt.com';
	Environment.gameserverUrl = 'http://development.gamejolt.net';
	Environment.mediaserverUrl = 'http://media.development.gamejolt.com';

	Environment.apiHost = 'http://development.gamejolt.com';
	Environment.gameserverApiHost = 'http://development.gamejolt.com';
	Environment.activityStreamHost = 'http://activity.development.gamejolt.com';
	Environment.chatHost = 'http://chat.development.gamejolt.com';
	Environment.widgetHost = 'http://localhost:8086';
}

if (GJ_IS_CLIENT) {
	// When it gets packaged up for production, the URL changes.
	if (
		window.location.href.search(/^app\:\/\/game\-jolt\-client\/package\//) !==
		-1
	) {
		Environment.wttfBaseUrl = 'app://game-jolt-client/package/index.html#!';
		Environment.authBaseUrl = 'app://game-jolt-client/package/auth.html#!';
		Environment.checkoutBaseUrl =
			'app://game-jolt-client/package/checkout.html#!';
	} else {
		Environment.wttfBaseUrl = 'app://game-jolt-client/index.html#!';
		Environment.authBaseUrl = 'app://game-jolt-client/auth.html#!';
		Environment.checkoutBaseUrl = 'app://game-jolt-client/checkout.html#!';
	}
}
