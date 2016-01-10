angular.module( 'gj.Scroll.AutoScroll' ).directive( 'gjAutoScrollAnchor', function( AutoScroll )
{
	return {
		restrict: 'A',
		link: function( scope, element )
		{
			AutoScroll.anchor( element );

			scope.$on( '$destroy', function()
			{
				AutoScroll.anchor( null );
			} );
		}
	};
} );
