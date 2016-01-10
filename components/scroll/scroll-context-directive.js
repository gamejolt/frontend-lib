angular.module( 'gj.Scroll' ).directive( 'gjScrollContext', function( $parse, Scroll )
{
	return {
		restrict: 'A',
		link: function( scope, element, attrs )
		{
			scope.$watch( $parse( attrs.gjScrollContext ), function( isActive )
			{
				if ( isActive ) {
					Scroll.setContext( element );
				}
				else {
					Scroll.setContext( false );
				}
			} );
		}
	};
} );
