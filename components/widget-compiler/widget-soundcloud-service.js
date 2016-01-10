angular.module( 'gj.WidgetCompiler' ).service( 'WidgetCompiler_Widget_Soundcloud', function( $compile )
{
	this.name = 'soundcloud';

	var _template = '<gj-widget-soundcloud gj-widget-soundcloud-track-id="trackId" gj-widget-soundcloud-color="color"></gj-widget-soundcloud>';

	this.compile = function( scope, params )
	{
		if ( !params || !params.length ) {
			return null;
		}

		// Track ID is always first.
		scope.trackId = params[0];

		// Then an optional color.
		if ( angular.isDefined( params[1] ) ) {
			scope.color = params[1].replace( /[^0-9A-Za-z]/g, '' );
		}

		return $compile( _template )( scope );
	};
} );
