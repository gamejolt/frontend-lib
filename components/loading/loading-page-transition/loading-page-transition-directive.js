angular.module( 'gj.Loading.LoadingPageTransition' ).directive( 'gjLoadingPageTransition', function( $rootScope, $animate, $timeout )
{
	return {
		restrict: 'A',
		link: function( scope, element )
		{
			var startListener = undefined;
			var successListener = undefined;

			element.addClass( 'loading-page-transition' );

			startListener = $rootScope.$on( 'cfpLoadingBar:started', function()
			{
				element.addClass( 'loading-page-transitioning' );
			} );

			successListener = $rootScope.$on( 'cfpLoadingBar:completed', function()
			{
				element.removeClass( 'loading-page-transitioning' );
			} );

			scope.$on( '$destroy', function()
			{
				if ( startListener ) {
					startListener();
					startListener = undefined;
				}

				if ( successListener ) {
					successListener();
					successListener = undefined;
				}
			} );
		}
	};
} );