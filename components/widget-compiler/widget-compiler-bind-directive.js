angular.module( 'gj.WidgetCompiler' ).directive( 'gjWidgetCompilerBind', function( $parse, WidgetCompiler )
{
	return {
		restrict: 'A',
		link: function( scope, element, attrs )
		{
			var isDisabled = false;
			var content = null;

			if ( angular.isDefined( attrs.widgetCompilerDisabled ) ) {
				if ( attrs.widgetCompilerDisabled === '' ) {
					isDisabled = true;
				}
				else {
					scope.$watch( $parse( attrs.widgetCompilerDisabled ), function( _isDisabled )
					{
						isDisabled = _isDisabled;
						update();
					} );
				}
			}

			scope.$watch( attrs.gjWidgetCompilerBind, function( _content )
			{
				content = _content;
				update();
			} );

			function update()
			{
				if ( !content ) {
					element.empty();
					return;
				}

				if ( isDisabled ) {
					element.html( content );
				}
				else {
					element.empty().append( WidgetCompiler.compile( scope, content ) );
				}
			}
		}
	};
} );
