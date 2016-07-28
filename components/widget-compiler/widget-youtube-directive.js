angular.module( 'gj.WidgetCompiler' ).directive( 'gjWidgetYoutube', function()
{
	return {
		restrict: 'E',
		template: '<gj-video-embed video-provider="youtube" video-id="videoId"></gj-video-embed>',
		scope: {
			videoId: '=gjWidgetYoutubeVideoId'
		},
	};
} );
