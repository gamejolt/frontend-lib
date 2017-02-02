angular.module( 'gj.FadeCollapse' ).directive( 'gjFadeCollapse', function(
	$timeout, $parse, $position, $window, $transition, Screen, Scroll, Environment )
{
	var EXTRA_COLLAPSE_PADDING = 200;

	return {
		restrict: 'E',
		transclude: true,
		scope: true,
		template: require( '!html-loader!./fade-collapse.html' ),
		controllerAs: 'ctrl',
		bindToController: true,
		link: function( scope, element, attrs )
		{
			// No need to do anything if prerendering.
			// We want to show all the content.
			if ( Environment.isPrerender ) {
				return;
			}

			var fadeElem = element.children( 1 );
			var collapseHeight = $parse( attrs.fadeCollapseHeight )( scope );
			var isPrimed = false;

			var isOpenParsed = null;
			if ( attrs.fadeCollapseIsOpen ) {
				isOpenParsed = $parse( attrs.fadeCollapseIsOpen );
			}

			var isRequiredParsed = null;
			if ( attrs.fadeCollapseIsRequired ) {
				isRequiredParsed = $parse( attrs.fadeCollapseIsRequired );
			}

			function setup()
			{
				var isRequired = false;
				if ( fadeElem[0].scrollHeight > collapseHeight ) {
					isRequired = true;
				}

				if ( isRequiredParsed && isRequiredParsed.assign ) {
					isRequiredParsed.assign( scope, isRequired );
				}

				if ( isRequired ) {
					if ( isOpenParsed ) {
						setupWatcher();
					}
					else {
						collapse();
					}
				}
			}

			function collapse()
			{
				fadeElem.addClass( 'fade-collapse-collapsed' );
				var transitionPromise = $transition( fadeElem, { height: collapseHeight + 'px' } );

				if ( isPrimed ) {

					// We will scroll to the bottom of the element minus some extra padding.
					// This keeps the element in view a bit.
					var scrollTo = Scroll.getElementOffsetFromContext( fadeElem ) + collapseHeight - EXTRA_COLLAPSE_PADDING;

					// Only if we're past where we would scroll.
					if ( Scroll.context.duScrollTop() > scrollTo ) {

						// If we're on a tiny screen, don't animate the scroll.
						// Just set it and move on.
						if ( Screen.isXs ) {
							Scroll.context.duScrollTop( scrollTo );
						}
						// Otherwise set up a scroll animation to follow the bottom of the element as it collapses.
						else {
							setupScrollAnim( transitionPromise );
						}
					}
				}
			}

			function expand()
			{
				fadeElem[0].style.height = fadeElem[0].scrollHeight + 'px';
				fadeElem.removeClass( 'fade-collapse-collapsed' );
			}

			function setupWatcher()
			{
				scope.$watch( isOpenParsed, function( isOpen )
				{
					if ( isOpen ) {
						expand();
					}
					else {
						collapse();
					}

					isPrimed = true;
				} );

				// Set as not open initially.
				isOpenParsed.assign( scope, false );
			}

			var frameRequestHandle = null;
			function setupScrollAnim( transitionPromise )
			{
				// Start the loop.
				frameRequestHandle = $window.requestAnimationFrame( animStep );

				// This sets up a resolve that will cancel the scroll anim loop
				// as soon as the CSS transition is finished.
				transitionPromise.then( function()
				{
					$window.cancelAnimationFrame( frameRequestHandle );
					frameRequestHandle = null;
				} );
			}

			function animStep()
			{
				// Bottom of element from the scroll context top.
				// We then subtract some padding so that they still see some of the element while scrolling.
				var curPos = Scroll.getElementOffsetFromContext( fadeElem ) + fadeElem[0].offsetHeight - EXTRA_COLLAPSE_PADDING;

				// Only scroll if we have to.
				// This will allow the element to collapse freely until our marker would go out of view.
				// Then we scroll.
				if ( Scroll.context.duScrollTop() > curPos ) {
					Scroll.context.duScrollTop( curPos );
				}

				// Request another frame to loop again.
				frameRequestHandle = $window.requestAnimationFrame( animStep );
			}

			// Needs to compile DOM first.
			$timeout( function()
			{
				setup();
			}, 10 );
		}
	};
} );
