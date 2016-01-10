angular.module( 'gj.WidgetCompiler' ).directive( 'gjWidgetVimeo', function( $sce, $rootScope, $timeout, Screen, Ruler )
{
	return {
		restrict: 'E',
		template: '<iframe nwdisable nwfaketop type="text/html" frameborder="0" width="100%" height="{{videoHeight}}" ng-src="{{embedSrc}}"></iframe>',
		scope: {
			videoId: '=gjWidgetVimeoVideoId'
		},
		link: function( scope, element )
		{
			scope.embedSrc = $sce.trustAsResourceUrl( 'https://player.vimeo.com/video/' + scope.videoId );

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
