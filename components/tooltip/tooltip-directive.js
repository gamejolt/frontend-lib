angular.module( 'gj.Tooltip' ).directive( 'gjTooltip', function( $compile, Screen )
{
	return {
		priority: 100000,
		terminal: true,
		restrict: 'A',
		link: {
			pre: function( scope, element, attrs )
			{
				// Ensure Screen is on the scope.
				if ( !scope.Screen ) {
					scope.Screen = Screen;
				}

				// Remove this directive so that we don't go in an infinite loop.
				element.removeAttr( 'gj-tooltip' );

				// Add the tooltip stuff, yo.
				element.attr( 'tooltip', '{{ (!Screen.isXs ? (' + attrs.gjTooltip + ') : "") }}' );

				// Recompile the element with the new attributes.
				$compile( element )( scope );
			}
		}
	};
} );
