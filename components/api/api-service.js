angular.module( 'gj.Api' ).service( 'Api', function( $window, $http, $injector, Environment, Payload )
{
	var _this = this;

	this.apiHost = Environment.apiHost;
	this.apiPath = '/site-api';

	this.sendRequest = function( uri, postData, options )
	{
		options = $window._.defaults( options || {}, {

			// Files to upload can be passed in through here.
			file: null,

			// Whether or not to ignore the loading bar.
			ignoreLoadingBar: false,

			// Whether or not to process the payload at the end.
			processPayload: true,

			// Whether or not to send in the credentials.
			withCredentials: true,

			// Will filter out functions, sub-objects and sub-arrays from sending to the server.
			sanitizeComplexData: true,

			// A detached request tries to be outside of the system so it doesn't affect normal usage.
			// A shorthand for many options.
			// - ignores loading bar
			// - will ignore the user from the payload
			// - will ignore the version number so it doesn't refresh
			// - won't direct to an error page if there was a status code error
			detach: false,
		} );

		// Set up the detachment options if detach is set.
		if ( options.detach ) {
			options.ignoreLoadingBar = true;
			options.ignorePayloadUser = true;
			options.ignorePayloadVersion = true;
			options.noErrorRedirect = true;
		}

		if ( postData ) {
			var sanitizedPostData = {};
			angular.forEach( postData, function( value, key )
			{
				if ( angular.isUndefined( value ) ) {
					return;
				}

				// Complex data allows certain known objects to pass through to the server.
				// It must be set explicitly if you want to send in an object as a value.
				if ( options.sanitizeComplexData ) {
					if ( (options.allowComplexData && options.allowComplexData.indexOf( key ) !== -1)
						|| (!angular.isFunction( value ) && !angular.isObject( value ) && !angular.isArray( value ))
					) {
						sanitizedPostData[ key ] = value;
					}
				}
				else {
					sanitizedPostData[ key ] = value;
				}
			} );
		}

		// Normal request...
		if ( !options.file ) {
			var requestPromise = $http( {
				method: (sanitizedPostData ? 'POST' : 'GET'),
				url: _this.apiHost + _this.apiPath + uri,
				data: (sanitizedPostData || ''),
				withCredentials: options.withCredentials,
				ignoreLoadingBar: options.ignoreLoadingBar
			} );
		}
		// File upload.
		else {
			$upload = $injector.get( '$upload' );

			var requestPromise = $upload.upload( {
				method: 'POST',
				url: _this.apiHost + _this.apiPath + uri,
				data: (sanitizedPostData || undefined),
				file: options.file,
				withCredentials: options.withCredentials,
				ignoreLoadingBar: true  // Force ignore in upload.
			} );
		}

		// If we aren't processing the payload, then just return the promise.
		if ( !options.processPayload ) {
			return requestPromise;
		}

		return Payload.processResponse( requestPromise, options );
	};
} );
