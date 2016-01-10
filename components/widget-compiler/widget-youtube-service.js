angular.module( 'gj.WidgetCompiler' ).service( 'WidgetCompiler_Widget_YouTube', function( $compile )
{
	this.name = 'youtube';

	var _template = '<gj-widget-youtube gj-widget-youtube-video-id="videoId"></gj-widget-youtube>';

	this.compile = function( scope, params )
	{
		if ( !params || !params.length ) {
			return null;
		}

		scope.videoId = params[0];

		return $compile( _template )( scope );
	};
} );
