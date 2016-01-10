angular.module( 'gj.Screen' ).directive( 'gjScreenContext', function( $parse, Screen )
{
	return {
		restrict: 'A',
		link: function( scope, element, attrs )
		{
			scope.$watch( $parse( attrs.gjScreenContext ), function( isActive )
			{
				if ( isActive ) {
					Screen.setContext( element );
				}
				else {
					Screen.setContext( false );
				}

				// Recalculate in the next "loop".
				// This gives the system time to set up any changes like ng-class or anything
				// on the scroll context which may end up changing widths and heights and stuff.
				scope.$applyAsync( function()
				{
					Screen.recalculate();
				} );
			} );
		}
	};
} );
