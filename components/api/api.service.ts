import { Injectable, Inject } from '@angular/core';
import { Http, RequestMethod } from '@angular/http';

import { App } from '../app/app.service';
import { Environment } from '../environment/environment.service';
// import { User } from '../user/user.model';

export interface RequestOptions {

	// Files to upload can be passed in through here.
	// file?: null;

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
};

@Injectable()
export class Api
{
	public apiHost: string;
	apiPath = '/site-api';

	constructor(
		private http: Http,
		private app: App,
		private env: Environment,
		// @Inject( User ) private userModel: typeof User,
	)
	{
		this.apiHost = this.env.apiHost;
	}

	sendRequest( uri: string, postData?: any, options: RequestOptions = {} ): Promise<any>
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

		return this.http.request(
			(options.apiHost || this.apiHost) + (options.apiPath || this.apiPath) + uri,
			{
				method: (sanitizedPostData ? RequestMethod.Post : RequestMethod.Get),
				withCredentials: options.withCredentials,
				body: sanitizedPostData,
				// ignoreLoadingBar: options.ignoreLoadingBar
			}
		)
		.map( ( response ) =>
		{
			const data = response.json();

			if ( data.payload ) {
				this.checkPayloadUser( data.payload, options );

				return data.payload;
			}

			return response;
		} )
		.toPromise();

		// Normal request...
		// if ( !options.file ) {

		// }
		// // File upload.
		// else {
		// 	$upload = $injector.get( '$upload' );

		// 	// You can pass in an object of files if you want to upload multiple.
		// 	// Otherwise file should be the single file to upload.
		// 	// For multiple upload, the key should be the name of the form field, the value should be the file.
		// 	// Example: { file: file1, file_other: file2 }
		// 	if ( !angular.isArray( options.file ) ) {
		// 		options.fileFormDataName = Object.keys( options.file );
		// 		options.file = _.flatten( _.values( options.file ) );
		// 	}
		// 	else {
		// 		// Multi file upload in same form control.
		// 		if ( options.file.length > 1 ) {
		// 			options.fileFormDataName = 'file[]';
		// 		}
		// 		else {
		// 			options.fileFormDataName = 'file';
		// 		}
		// 	}

		// 	var requestPromise = $upload.upload( {
		// 		method: 'POST',
		// 		url: (options.apiHost || _this.apiHost) + (options.apiPath || _this.apiPath) + uri,
		// 		data: (sanitizedPostData || undefined),
		// 		file: options.file,
		// 		fileFormDataName: options.fileFormDataName,
		// 		withCredentials: options.withCredentials,
		// 		ignoreLoadingBar: true  // Force ignore in upload.
		// 	} );
		// }

		// // If we aren't processing the payload, then just return the promise.
		// if ( !options.processPayload ) {
		// 	return requestPromise;
		// }

		// return this.processResponse( requestPromise, options );
	}

	private checkPayloadUser( response: any, options: RequestOptions )
	{
		if ( !response || options.ignorePayloadUser ) {
			return;
		}

		// Only process if this payload response had a user attached to it. It
		// couid be null (for logged out) or an object (if logged in).
		if ( typeof response.user !== 'undefined' ) {

			// If they are logged out, we want to ensure the app user is
			// nulled as well.
			if ( response.user === null ) {
				this.app.user = undefined;
			}
			// Otherwise we set up the user with the new data.
			else {
				// this.app.user = new this.userModel( response.user );
			}
		}
	}
}
