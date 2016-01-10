angular.module( 'gj.Payload' ).service( 'Payload', function( App, Environment, $window, $location, $q, $rootScope, $state, $injector )
{
	var _this = this;

	this.ERROR_NEW_VERSION = 'payload-new-version';
	this.ERROR_NOT_LOGGED = 'payload-not-logged';
	this.ERROR_REDIRECT = 'payload-redirect';
	this.ERROR_INVALID = 'payload-invalid';
	this.ERROR_HTTP_ERROR = 'payload-error';
	this.ERROR_OFFLINE = 'payload-offline';

	var errorHandlers = [];

	// We have to set up a watch on stateChangeErrors.
	// If the error is that we got a new version, then we need to refresh the whole window and follow the new URL.
	// This will force an update of the whole page to pull in the new version's code.
	$rootScope.$on( '$stateChangeError', function( event, toState, toParams, fromState, fromParams, error )
	{
		// Only process if it's a payload error.
		if ( !error || !error.type || error.type != 'payload' ) {
			return;
		}

		// Handlers can return false to stop processing other handlers set up.
		// They can `.preventDefault()` to not do the default handling below.
		if ( errorHandlers.length ) {
			for ( var i = 0; i < errorHandlers.length; ++i ) {
				if ( errorHandlers[ i ]( event, toState, toParams, fromState, fromParams, error ) === false ) {
					break;
				}
			}
		}

		if ( !event.defaultPrevented ) {
			if ( error.error == _this.ERROR_NEW_VERSION ) {
				$window.location.href = $state.href( toState, toParams, { absolute: true } );
			}
			else if ( error.error == _this.ERROR_NOT_LOGGED ) {
				$window.location.href = Environment.authBaseUrl + '/login?redirect=' + encodeURIComponent( $location.url() );
			}
			else if ( error.error == _this.ERROR_INVALID ) {
				$state.go( 'error-500' );
			}
			else if ( error.error == _this.ERROR_HTTP_ERROR ) {
				$state.go( 'error-' + (error.status || 500) );
			}
			else if ( error.error == _this.ERROR_OFFLINE ) {
				var retryUrl = $state.href( toState, toParams );
				$state.go( 'error-offline', { retryUrl: retryUrl } );
			}
		}
	} );

	function checkRedirect( response, deferred )
	{
		if ( !response || !response.data ) {
			return;
		}

		if ( response.data.redirect ) {

			// Redirecting within the app.
			$window.location.url = response.data.redirect;

			// Reject the request.
			deferred.reject( {
				type: 'payload',
				error: _this.ERROR_REDIRECT,
				response: response.data,
			} );

			return true;
		}

		return false;
	}

	function checkPayloadUser( response, options )
	{
		if ( !response || !response.data ) {
			return;
		}

		var data = response.data;

		// If there is a User model, then attempt to create one and attach it to the App.
		// This shows who is "logged in". We have to use the $injector because if the Payload
		// service depends on User, then it results in a circular dependency.
		if ( !options.ignorePayloadUser ) {

			// Only process if this payload response had a user attached to it.
			// It couid be null (for logged out) or an object (if logged in).
			if ( $injector.has( 'User' ) && angular.isDefined( data.user ) ) {
				var User = $injector.get( 'User' );

				// Only process if it's changed.
				if ( !angular.equals( data.user, App.user ) ) {

					// If they are logged out, we want to ensure the app user is nulled as well.
					if ( data.user === null ) {
						App.user = null;
					}
					// Otherwise we set up the user with the new data.
					else {
						App.user = new User( data.user );
					}
				}
			}

			// Emit an event to the root scope that a payload has been received and the user has been set.
			$rootScope.$emit( 'Payload.userProcessed', !!App.user );
		}
	}

	function checkAnalyticsExperiments( response, options )
	{
		if ( !$injector.has( 'Analytics' ) || !response || !response.data || !response.data.payload ) {
			return;
		}

		var payload = response.data.payload;
		if ( angular.isDefined( payload._experiment ) && payload._experiment && angular.isDefined( payload._variation ) && payload._variation != -1 ) {
			$injector.get( 'Analytics' ).setCurrentExperiment( payload._experiment, payload._variation );
		}
	}

	this.processResponse = function( responsePromise, options )
	{
		options = _.defaults( options || {}, {

			// Whether or not when we process the response if we should pull
			// the user data in from the response to our App.
			ignorePayloadUser: false,

			// Will ignore the check of the app version so it doesn't force a reload of the shell if they differ.
			ignorePayloadVersion: false,

			// Will cause it not to direct to an error page when an error occurs.
			// This may be useful when the request wasn't used to fulfill a route.
			noErrorRedirect: false,
		} );

		var deferred = $q.defer();

		// Wrap the response promise in our own deferred promise handler.
		responsePromise.then(

			// Success.
			function( response )
			{
				var data = response.data;

				if ( checkRedirect( response, deferred ) ) {
					return;
				}

				// Payload's version is different than our version?
				// We ignore completely if we're in the client.
				// We don't want the client refreshing when an update to site is pushed out.
				if ( !options.ignorePayloadVersion && !Environment.isClient ) {
					if ( data.ver != App.ver ) {

						// If we didn't have a version, then it's the first payload.
						// Simply assign it.
						if ( App.ver === null ) {
							App.ver = data.ver;
						}
						// Otherwise a new version was released.
						// We need to refresh the whole page.
						else {

							// Reject with the ERROR_NEW_VERSION error.
							// The $stateChangeError event will catch this and reload the page to the new route.
							return deferred.reject( {
								type: 'payload',
								error: _this.ERROR_NEW_VERSION
							} );
						}
					}
				}

				checkPayloadUser( response, options );

				if ( data.payload ) {
					checkAnalyticsExperiments( response, options );
					$rootScope.$emit( 'Payload.responseSuccess', response );
					deferred.resolve( data.payload );
				}
				else {
					if ( !options.noErrorRedirect ) {
						deferred.reject( {
							type: 'payload',
							error: _this.ERROR_INVALID,
							response: response.data || null,
						} );
					}
					else {
						deferred.reject( response.data || null );
					}
				}
			},

			// Error.
			function( response )
			{
				if ( checkRedirect( response, deferred ) ) {
					return;
				}

				checkPayloadUser( response, options );

				// Send an event and let other services react.
				var event = $rootScope.$emit( 'Payload.responseError', response, options );

				// If the default was prevented, then we want to allow the response to resolve even though it failed.
				if ( event.defaultPrevented ) {
					deferred.resolve( response );
					return;
				}

				if ( !options.noErrorRedirect ) {

					// If the response indicated a failed connection.
					if ( response.status == -1 ) {
						deferred.reject( {
							type: 'payload',
							error: _this.ERROR_OFFLINE,
							response: null,
						} );
					}
					// If it was a 401 error, then they need to be logged in.
					// Let's redirect them to the login page on the main site.
					else if ( response.status == 401 ) {
						deferred.reject( {
							type: 'payload',
							error: _this.ERROR_NOT_LOGGED,
							response: response.data || null,
						} );
					}
					// Otherwise, show an error page.
					else {
						deferred.reject( {
							type: 'payload',
							error: _this.ERROR_HTTP_ERROR,
							response: response.data || null,
							status: response.status || undefined,
						} );
					}
				}
				else {
					deferred.reject( response );
				}
			},

			// Progress.
			function( progress )
			{
				// Pass on any notifications from the previous handler to the new one.
				deferred.notify( progress );
			}
		);

		return deferred.promise;
	};

	this.addErrorHandler = function( handler )
	{
		errorHandlers.push( handler );
	};

	this.removeErrorHandler = function( handler )
	{
		_.pull( errorHandlers, handler );
	};
} );
