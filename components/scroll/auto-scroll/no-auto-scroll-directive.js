angular.module( 'gj.Scroll.AutoScroll' ).directive( 'gjNoAutoScroll', function( $parse, AutoScroll )
{
	return {
		restrict: 'A',
		link: function( scope, element, attrs )
		{
			var isBound = false;

			function setNoScroll()
			{
				// Set to not scroll on next auto-scroll check.
				// It will get cleared by the auto-scroll directive set on the scroller element.
				AutoScroll.noScroll( true );
			}

			scope.$watch( $parse( attrs.gjNoAutoScroll ), function( noScroll )
			{
				// If an empty attribute, or if noScroll is true, bind it.
				if ( angular.isUndefined( noScroll ) || noScroll ) {
					element.on( 'click', setNoScroll );
					isBound = true;
				}
				// Otherwise if we're turning off make sure we're not bound.
				else if ( isBound ) {
					element.off( 'click', setNoScroll );
					isBound = false;
				}
			} );
		}
	};
} );
