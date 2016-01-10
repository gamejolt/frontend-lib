angular.module( 'gj.Scroll.Parallax' ).directive( 'gjParallaxScroll', function( $window, $timeout, $parse, Scroll, Screen, Ruler )
{
	/**
	 * Get's the element's top offset from the scroll context viewport.
	 */
	function _getElementTop( element, currentTransform )
	{
		var elementTop = Scroll.getElementOffsetFromContext( element );

		// If we've transformed the element already, we have to remove that transformation from the result.
		// This is because transforming changes the value returned by offset().
		if ( currentTransform ) {
			elementTop -= currentTransform;
		}

		return elementTop;
	}

	return {
		restrict: 'A',
		link: function( scope, element, attrs )
		{
			// Check once on load whether or not we should parallax this.
			if ( attrs.gjParallaxScroll.trim() !== '' && !$parse( attrs.gjParallaxScroll )( scope ) ) {
				return;
			}

			var waitingForFrame = false;
			var scrollDrag = null;
			var scrollDim = null;

			var _currentTransform = 0;
			var _currentOpacity = 0;

			if ( angular.isDefined( attrs.scrollDrag ) ) {
				scope.$watch( $parse( attrs.scrollDrag ), function( _scrollDrag )
				{
					scrollDrag = _scrollDrag;
				} );
			}

			if ( angular.isDefined( attrs.scrollDim ) ) {
				scope.$watch( $parse( attrs.scrollDim ), function( _scrollDim )
				{
					scrollDim = _scrollDim;
				} );
			}

			var positionReset = false;
			var dimReset = false;
			var initialOpacity = 1;

			// May need time to compile and place into the DOM first.
			$timeout( function()
			{
				var styles = $window.getComputedStyle( element[0] );
				initialOpacity = styles.opacity;
			} );

			function onScroll()
			{
				if ( !waitingForFrame ) {
					waitingForFrame = true;
					$window.requestAnimationFrame( step );
				}
			}

			function step()
			{
				waitingForFrame = false;
				var css = {};

				// The amount that we've scrolled on the page so far.
				var currentScrollAmount = Scroll.context.scrollTop();

				// The height of the scroller viewport.
				var scrollerHeight = Ruler.outerHeight( Scroll.context[0] );

				// The height of the element.
				var elementHeight = Ruler.outerHeight( element[0] );

				// Get the element top. This is the offset from the top of the scroller viewport.
				var elementTop = _getElementTop( element, _currentTransform );

				// The amount that we've scrolled PAST the element top.
				// This is the value that we do calculations on.
				var scrollDelta = 0;

				// If the element is taller than the scroller viewport, then add
				// extra spacing so that it doesn't start scrolling until the bottom of
				// the element is in view.
				if ( elementHeight > scrollerHeight ) {
					elementTop += elementHeight - scrollerHeight;
				}

				// If we are past the end of the scrolling/parallax effect, quit early.
				if ( currentScrollAmount > elementHeight + elementTop ) {
					return;
				}

				// If we've scrolled past the element top, then we need to start calculating the parallax effect.
				if ( currentScrollAmount > elementTop ) {
					scrollDelta = currentScrollAmount - elementTop;
				}
				// If we haven't scrolled past yet (and are still in the top), make sure our current transform value
				// is reset.
				else {
					_currentTransform = 0;
					_currentOpacity = 0;
				}

				// If we have scroll drag, then we need to calculate the current transformation value.
				if ( scrollDrag ) {
					if ( scrollDelta) {
						_currentTransform = scrollDelta * scrollDrag;
						css.transform = 'translate3d( 0, ' + _currentTransform + 'px' + ', 0 )';
						positionReset = false;
					}
					else if ( !positionReset ) {
						css.transform = 'translate3d( 0, 0, 0 )';
						positionReset = true;
					}
				}

				// If we have scroll dimming then we need to calculate the current opacity value.
				if ( scrollDim ) {
					if ( scrollDelta ) {
						_currentOpacity = Math.max( 0, initialOpacity - (scrollDelta / elementHeight * scrollDim) );
						css.opacity = _currentOpacity;
						dimReset = false;
					}
					else if ( !dimReset ) {
						css.opacity = initialOpacity;
						dimReset = true;
					}
				}

				// console.log( 'currentScrollAmount: ' + currentScrollAmount + ', elementTop: ' + elementTop + ', elementHeight: ' + elementHeight + ', scrollDelta: ' + scrollDelta, ', transform: ' + _currentTransform + ', opacity: ' + _currentOpacity );

				element.css( css );
			}

			Scroll.setScrollSpy( scope, onScroll );
			Screen.setResizeSpy( scope, onScroll );
		}
	};
} );
