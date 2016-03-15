angular.module( 'gj.Error', [] ).config( function( $stateProvider, $urlRouterProvider )
{
	[
		400,
		403,
		404,
		500,
	]
	.forEach( function( code )
	{
		$stateProvider.state( 'error-' + code, {
			templateUrl: /*!*/ '/lib/gj-lib-client/components/error/error-' + code + '.html',
			resolve: {
				init: function( $injector )
				{
					if ( $injector.has( 'Translate' ) ) {
						return injector.get( 'Translate' ).loadSection( 'main' );
					}
				},
			}
		} );
	} );

	// We want the offline error to have a URL.
	// This allows it to go to a new page so that when you press the back button in browser
	// it will reload previous page correctly.
	$stateProvider.state( 'error-offline', {
		url: '/error-offline?retryUrl',
		templateUrl: '/lib/gj-lib-client/components/error/error-offline.html',
		controllerAs: 'ctrl',
		controller: function( $location, $stateParams )
		{
			// It gets encoded, so we have to decode it.
			var retryUrl = decodeURIComponent( $stateParams.retryUrl );

			// Client adds #! to URLs. Site doesn't.
			if ( retryUrl.search( /^\#\!/ ) !== -1 ) {
				retryUrl = retryUrl.substring( 2 );
			}

			this.retry = function()
			{
				$location.url( retryUrl );
			};
		},
		resolve: {
			init: function( $injector )
			{
				if ( $injector.has( 'Translate' ) ) {
					return injector.get( 'Translate' ).loadSection( 'main' );
				}
			},
		}
	} );

	$urlRouterProvider.otherwise( function( $injector, $location )
	{
		$injector.get( '$state' ).go( 'error-404' );

		// Return true to signify that we took care of it.
		// This is what we want since we navigated to the error route on our own.
		return true;
	} );
} );
