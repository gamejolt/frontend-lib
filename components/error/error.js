angular.module( 'gj.Error', [] ).config( function( $stateProvider, $urlRouterProvider )
{
	[
		{ code: 400, template: '/lib/gj-lib-client/components/error/error-400.html' },
		{ code: 403, template: '/lib/gj-lib-client/components/error/error-403.html' },
		{ code: 404, template: '/lib/gj-lib-client/components/error/error-404.html' },
		{ code: 500, template: '/lib/gj-lib-client/components/error/error-500.html' },
	]
	.forEach( function( data )
	{
		$stateProvider.state( 'error-' + data.code, {
			templateUrl: data.template,
			resolve: {
				init: function( $injector )
				{
					if ( $injector.has( 'Translate' ) ) {
						return $injector.get( 'Translate' ).loadSection( 'main' );
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
					return $injector.get( 'Translate' ).loadSection( 'main' );
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
