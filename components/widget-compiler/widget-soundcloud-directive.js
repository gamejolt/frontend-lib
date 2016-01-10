angular.module( 'gj.WidgetCompiler' ).directive( 'gjWidgetSoundcloud', function( $sce )
{
	return {
		restrict: 'E',
		template: '<iframe nwdisable nwfaketop width="100%" height="166" scrolling="no" frameborder="no" ng-src="{{embedSrc}}"></iframe>',
		scope: {
			trackId: '=gjWidgetSoundcloudTrackId',
			color: '=gjWidgetSoundcloudColor'
		},
		link: function( scope, element )
		{
			scope.embedSrc = 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/' + scope.trackId;

			if ( angular.isDefined( scope.color ) ) {
				scope.embedSrc += '&amp;color=' + scope.color;
			}

			scope.embedSrc = $sce.trustAsResourceUrl( scope.embedSrc );
		}
	};
} );
