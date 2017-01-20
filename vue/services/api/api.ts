import * as request from 'superagent';
import * as Vuex from 'vuex';

import { MutClearUser, MutSetUser } from '../app/app-store';

export interface RequestOptions
{
	/**
	 * Whether or not to show the loading bar.
	 */
	ignoreLoadingBar?: boolean;

	/**
	 * Whether or not to process the payload at the end.
	 */
	processPayload?: boolean;

	/**
	 * Whether or not we pull in the user from the payload.
	 */
	ignorePayloadUser?: boolean;

	/**
	 * When payload version changes, we will refresh the page. Whether or not we
	 * ignore the payload version.
	 */
	ignorePayloadVersion?: boolean;

	/**
	 * Whether or not we should redirect to an error page if there was an error.
	 */
	noErrorRedirect?: boolean;

	/**
	 * Whether or not to send in the credentials.
	 */
	withCredentials?: boolean;

	/**
	 * Will filter out functions, sub-objects and sub-arrays from sending to the
	 * server.
	 */
	sanitizeComplexData?: boolean;

	/**
	 * This should be an array of fields that you don't want to sanitize/filter
	 * in the POST data. Use it as a whitelist of fields to pass through.
	 */
	allowComplexData?: string[];

	/**
	 * A detached request tries to be outside of the system so it doesn't affect
	 * normal usage. A shorthand for many options. - ignores loading bar - will
	 * ignore the user from the payload - will ignore the version number so it
	 * doesn't refresh - won't direct to an error page if there was a status
	 * code error
	 */
	detach?: boolean;

	/**
	 * You can change the default api host/path used through these.
	 */
	apiHost?: string;
	apiPath?: string;
}

export class Api
{
	static apiHost: string = 'http://development.gamejolt.com';
	static apiPath = '/site-api';

	private static store?: Vuex.Store<any>;

	static setStore( store: Vuex.Store<any> )
	{
		this.store = store;
	}

	// constructor(
	// 	private http: Http,
	// 	private app: App,
	// 	private env: Environment,
	// 	// @Inject( User ) private userModel: typeof User,
	// )
	// {
	// 	this.apiHost = this.env.apiHost;
	// }

	static async sendRequest( uri: string, postData?: any, options: RequestOptions = {} ): Promise<any>
	{
		options = { ...<RequestOptions>{
			processPayload: true,
			withCredentials: true,
			sanitizeComplexData: true,
			allowComplexData: [],
			detach: false,
		}, ...options };

		// Set up the detachment options if detach is set.
		if ( options.detach ) {
			options.ignoreLoadingBar = true;
			options.ignorePayloadUser = true;
			options.ignorePayloadVersion = true;
			options.noErrorRedirect = true;
		}

		let sanitizedPostData: any = undefined;
		if ( postData ) {
			sanitizedPostData = {};
			for ( const key of Object.keys( postData ) ) {
				const value = postData[ key ];
				const valueType = typeof value;

				if ( valueType === 'undefined' ) {
					continue;
				}

				// Complex data allows certain known objects to pass through to the server.
				// It must be set explicitly if you want to send in an object as a value.
				if ( options.sanitizeComplexData ) {
					if ( (options.allowComplexData && options.allowComplexData.indexOf( key ) !== -1)
						|| (valueType !== 'function' && valueType !== 'object' && !Array.isArray( value ))
					) {
						sanitizedPostData[ key ] = value;
					}
				}
				else {
					sanitizedPostData[ key ] = value;
				}
			}
		}

		const method = sanitizedPostData ? 'POST' : 'GET';
		const url = (options.apiHost || this.apiHost) + (options.apiPath || this.apiPath) + uri;

		const _request = request( method, url )
			.send( sanitizedPostData );

		if ( options.withCredentials ) {
			_request.withCredentials();
		}

		return await _request
			.then( ( response ) =>
			{
				const data = JSON.parse( response.text );

				if ( data.payload ) {
					this.checkPayloadUser( data, options );
					return data.payload;
				}

				return data;
			} );
	}

	static checkPayloadUser( response: any, options: RequestOptions )
	{
		console.log( response, options, this.store );
		if ( !response || options.ignorePayloadUser || !this.store ) {
			return;
		}

		// Only process if this payload response had a user attached to it. It
		// couid be null (for logged out) or an object (if logged in).
		if ( typeof response.user !== 'undefined' ) {

			// If they are logged out, we want to ensure the app user is
			// nulled as well.
			if ( response.user === null ) {
				this.store.commit( MutClearUser );
			}
			// Otherwise we set up the user with the new data.
			else {
				this.store.commit( MutSetUser, response.user );
			}
		}
	}
}
