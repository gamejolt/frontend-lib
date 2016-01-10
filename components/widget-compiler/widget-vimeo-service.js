angular.module( 'gj.WidgetCompiler' ).service( 'WidgetCompiler_Widget_Vimeo', function( $compile )
{
	this.name = 'vimeo';

	var _template = '<gj-widget-vimeo gj-widget-vimeo-video-id="videoId"></gj-widget-vimeo>';

	this.compile = function( scope, params )
	{
		if ( !params || !params.length ) {
			return null;
		}

		scope.videoId = params[0];

		return $compile( _template )( scope );
	};
} );
