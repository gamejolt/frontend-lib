angular.module( 'gj.Scroll' ).directive( 'gjScrollWhen', function( Scroll, $parse )
{
	return {
		restrict: 'A',
		link: function( scope, element, attrs )
		{
			// If the attribute wasn't passed in, then we just want to scroll whenever
			// this element is initially created.
			if ( !attrs.gjScrollWhen ) {
				Scroll.to( element );
			}
			// Otherwise set up a watch to check when to focus this element.
			else {
				scope.$watch( $parse( attrs.gjScrollWhen ), function( newVal, oldVal )
				{
					if ( newVal != oldVal && newVal ) {
						Scroll.to( element );
					}
				} );
			}
		}
	};
} );
