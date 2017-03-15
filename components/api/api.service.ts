import { Environment } from '../environment/environment.service';
import { getProvider } from '../../utils/utils';
import { Payload } from '../payload/payload-service';

export interface RequestOptions
{
	/**
	 * Files to upload can be passed in through here.
	 */
	file?: any;

	/**
	 * Progress handler. Will only be used when uploading a file.
	 */
	progress?: ( event: ProgressEvent | undefined ) => void;

	/**
	 * Whether or not to show the loading bar.
	 */
	ignoreLoadingBar?: boolean;

	/**
	 * Whether or not to process the payload at the end.
	 */
	processPayload?: boolean;

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
	 * A detached request tries to be outside of the system so it doesn't affect
	 * normal usage. A shorthand for many options. - ignores loading bar - will
	 * ignore the user from the payload - will ignore the version number so it
	 * doesn't refresh - won't direct to an error page if there was a status
	 * code error
	 */
	detach?: boolean;

	// You can change the default api host/path used through these.
	apiHost?: string;
	apiPath?: string;
}

export interface ProgressEvent
{
	current: number;
	total: number;
}

export class Api
{
	static apiHost: string = Environment.apiHost;
	static apiPath = '/site-api';

	static async sendRequest( uri: string, postData?: any, options: RequestOptions = {} ): Promise<any>
	{
		options = { ...<RequestOptions>{
			ignoreLoadingBar: false,
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

		let requestPromise: Promise<any>;
		if ( GJ_IS_ANGULAR ) {
			requestPromise = this.createRequestAngular( method, url, sanitizedPostData, options );
		}
		else if ( GJ_IS_VUE ) {
			requestPromise = this.createRequestVue( method, url, sanitizedPostData, options );
		}
		else {
			throw new Error( 'Invalid environment.' );
		}

		// If we aren't processing the payload, then just return the promise.
		if ( !options.processPayload ) {
			return await requestPromise;
		}

		return await Payload.processResponse( requestPromise, options );
	}

	private static createRequestAngular( method: string, url: string, data: any, options: RequestOptions )
	{
		// An upload request.
		if ( options.file ) {
			const Upload = getProvider<any>( 'Upload' );

			// Copy over since we'll modify.
			let _options: any = { ...{}, ...options };

			// NOTE: Got rid of this for now since we don't use it from what I know.
			// You can pass in an object of files if you want to upload multiple.
			// Otherwise file should be the single file to upload.
			// For multiple upload, the key should be the name of the form field, the value should be the file.
			// Example: { file: file1, file_other: file2 }
			// if ( !Array.isArray( options.file ) ) {
			// 	_options.fileFormDataName = Object.keys( _options.file );
			// 	_options.file = _.flatten( _.values( _options.file ) );
			// }
			// else {
				// Multi file upload in same form control.
				if ( Array.isArray( _options.file ) && _options.file.length <= 1 ) {
					_options.file = _options.file[0];
				}
			// }

			const uploadPromise = Upload.upload( {
				method: 'POST',
				url,
				data: { ...data, file: _options.file },
				withCredentials: _options.withCredentials,

				// Force ignore in upload.
				// We show a form upload progress bar instead.
				ignoreLoadingBar: true,
			} );

			// Set up progress events.
			uploadPromise
				.then( null, null, ( event: any ) =>
				{
					if ( options.progress && event.lengthComputable ) {
						options.progress( {
							current: event.loaded,
							total: event.total,
						} );
					}
				} )
				.then( () =>
				{
					if ( options.progress ) {
						options.progress( undefined );
					}
				} );

			return uploadPromise;
		}

		return getProvider<any>( '$http' )( {
			method,
			url,
			data,
			withCredentials: options.withCredentials,
			ignoreLoadingBar: options.ignoreLoadingBar
		} );
	}

	private static createRequestVue( method: string, url: string, data: any, options: RequestOptions )
	{
		if ( GJ_IS_VUE ) {
			if ( options.file ) {
				throw new Error( `Vue can't upload files yet.` );
			}

			const axios = require( 'axios' );

			return axios( {
				method,
				url,
				data,
				withCredentials: options.withCredentials,
			} );
		}
	}
}
