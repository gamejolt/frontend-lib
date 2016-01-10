angular.module( 'gj.WidgetCompiler' ).directive( 'gjWidgetYoutube', function( $sce, $rootScope, $timeout, Ruler, Screen )
{
	return {
		restrict: 'E',
		template: '<iframe nwdisable nwfaketop type="text/html" frameborder="0" width="100%" height="{{videoHeight}}" ng-src="{{embedSrc}}"></iframe>',
		scope: {
			videoId: '=gjWidgetYoutubeVideoId'
		},
		link: function( scope, element )
		{
			scope.embedSrc = $sce.trustAsResourceUrl( 'https://www.youtube.com/embed/' + scope.videoId );

			function recalculateDimensions()
			{
				scope.videoHeight = Ruler.width( element[0].getElementsByTagName( 'iframe' )[0] ) * 0.5625;
			};

			// Wait to be compiled before recalculating the first time.
			$timeout( function()
			{
				recalculateDimensions();
			} );

			// Also recalc every resize.
			Screen.setResizeSpy( scope, recalculateDimensions );
		}
	};
} );
