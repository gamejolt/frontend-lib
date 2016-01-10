angular.module( 'gj.Analytics', [ 'gj.Environment' ] );

angular.module( 'gj.Analytics' ).run( function( $rootScope, Analytics )
{
	function onChange( current )
	{
		// If we are redirecting to a new page, don't track the route.
		// This happens (for example) when there is a trailing slash at the end of the URL.
		if ( current && (current.$$route || current).redirectTo ) {
			return;
		}

		// Track the page view.
		Analytics.trackPageview();
	}

	$rootScope.$on( '$stateChangeSuccess', function( event, current )
	{
		onChange( current );
	} );
} );
