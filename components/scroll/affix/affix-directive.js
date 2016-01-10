angular.module( 'gj.Scroll.Affix' ).directive( 'gjScrollAffix', function( $rootScope, $window, $document, $position, $timeout, $parse, Scroll, Screen, Ruler )
{
	return {
		link: function( scope, element, attrs )
		{
			var elem = element[0];
			var top, target, className, placeholder, placeholderAttached;
			var timeoutCount, timeoutCancel;

			var shouldAffix = true;
			var isAffixedParsed = null;
			if ( attrs.isAffixed ) {
				isAffixedParsed = $parse( attrs.isAffixed );
			}

			function getOffsets()
			{
				// We pull from the placeholder if it's attached.
				// If we're scrolled past, then the placeholder will have the correct position.
				top = Scroll.getElementOffsetFromContext( placeholderAttached ? placeholder : element );

				if ( attrs.scrollOffset && angular.isString( attrs.scrollOffset ) ) {
					if ( attrs.scrollOffset.charAt( 0 ) === '-' ) {
						top -= parseFloat( attrs.scrollOffset.substr( 1 ) );
					}
					else if ( attrs.scrollOffset.charAt( 0 ) === '+' ) {
						top += parseFloat( attrs.scrollOffset.substr( 1 ) );
					}
				}
			}

			function checkScroll()
			{
				if ( !shouldAffix ) {
					return;
				}

				// Pull from the correct scroll context.
				var offset = Scroll.context.scrollTop();

				if ( !elem.classList.contains( className ) && offset > top ) {
					var width = Ruler.outerWidth( elem );
					var height = Ruler.outerHeight( elem );

					placeholder[0].style.height = height + 'px';
					elem.parentNode.insertBefore( placeholder[0], elem );
					placeholderAttached = true;

					elem.style.width = width + 'px';
					elem.classList.add( className );

					if ( isAffixedParsed && isAffixedParsed.assign ) {
						$rootScope.$apply( function()
						{
							isAffixedParsed.assign( scope, true );
						} );
					}
				}
				else if ( offset < top ) {
					off();
				}
			}

			function off()
			{
				if ( elem.classList.contains( className ) ) {
					placeholder.remove();
					placeholderAttached = false;

					elem.style.width = '';
					elem.classList.remove( className );

					if ( isAffixedParsed && isAffixedParsed.assign ) {
						$rootScope.$apply( function()
						{
							isAffixedParsed.assign( scope, false );
						} );
					}
				}
			}

			// This sets up a loop that syncs repeatedly for a bit.
			// This is needed if an action is done that may have triggered an animation
			// that would change height of element.
			function bootstrapTimeout()
			{
				timeoutCount = 0;
				if ( timeoutCancel ) {
					$timeout.cancel( timeoutCancel );
				}

				timeoutLoop();
			}

			function timeoutLoop()
			{
				timeoutCancel = $timeout( function()
				{
					sync();

					++timeoutCount;
					if ( timeoutCount <= 6 ) {
						timeoutLoop();
					}
				}, 500 );
			}

			function sync()
			{
				$timeout( function()
				{
					if ( shouldAffix ) {
						var prevTop = top;
						getOffsets();

						// Only check the scroll if our top value has changed.
						if ( prevTop !== top ) {
							checkScroll();
						}
					}
					else {
						off();
					}
				}, 1 );
			}

			className = attrs.gjScrollAffix || 'gj-scroll-affixed';
			placeholder = angular.element( '<div class="gj-scroll-affix-placeholder"></div>' );

			if ( angular.isDefined( attrs.shouldAffix ) ) {
				scope.$watch( $parse( attrs.shouldAffix ), function( _shouldAffix )
				{
					shouldAffix = _shouldAffix;
					sync();
				} );
			}

			// We initialize.
			bootstrapTimeout();
			Scroll.setScrollSpy( scope, checkScroll );

			// In case the click changed the page position, or changed element positions.
			$document.on( 'click', bootstrapTimeout );

			var stateChangeOn = $rootScope.$on( '$stateChangeSuccess', function()
			{
				bootstrapTimeout();
			} );

			Screen.setResizeSpy( scope, function()
			{
				// If we resized, then the element width most likely changed.
				// Pull from the placeholder which should be the source of the true width now.
				if ( placeholderAttached ) {
					elem.style.width = Ruler.outerWidth( placeholder[0] ) + 'px';
				}

				bootstrapTimeout();
			} );

			scope.$on( '$destroy', function()
			{
				$document.off( 'click', bootstrapTimeout );
				stateChangeOn();

				if ( timeoutCancel ) {
					$timeout.cancel( timeoutCancel );
				}
			} );
		}
	};
} );
