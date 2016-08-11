angular.module( 'gj.WidgetCompiler' ).directive( 'gjWidgetVimeo', function()
{
	return {
		restrict: 'E',
		template: '<gj-video-embed video-provider="vimeo" video-id="videoId"></gj-video-embed>',
		scope: {
			videoId: '=gjWidgetVimeoVideoId'
		},
	};
} );
