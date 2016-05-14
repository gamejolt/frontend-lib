angular.module( 'gj.Scroll.AutoScroll' ).directive( 'gjAutoScroll', function( $q, $window, $document, $timeout, $parse, $position, AutoScroll, History, Scroll, $state )
{
	return {
		link: function( scope, element, attrs )
		{
			var startWatcher, successWatcher, stateWatcher, prevAnchor;

			// If this element is the document body, then set the element to scroll to be the document.
			// This is what the browser scrolls by default.
			var scrollElem = element;
			if ( scrollElem[0] == $document[0].body ) {
				scrollElem = $document;
			}

			function doScroll( to )
			{
				// Only do this if a no-scroll wasn't set.
				// This can be set by a directive that will cancel out the auto-scrolling behavior for one auto-scroll cycle.
				if ( !AutoScroll.noScroll() ) {

					// Check to see if we have a saved history state for the page we're going to.
					var state = AutoScroll.getState( to );
					if ( History.inHistorical && state && state.scroll > 0 ) {

						// We need to let angular compile before attempting to scroll.
						// TODO: This causes a flicker of content before scrolling. Would be great to somehow get rid of this flicker.
						$timeout( function()
						{
							scrollElem.scrollTop( state.scroll );
						}, 0, false );
					}
					else {
						// When this is the document body, we need to pull the Scroll services offset top.
						// This is the height of any fixed elements in the shell.
						var scrollOffsetTop = 0;
						if ( scrollElem[0] === $document[0] ) {
							scrollOffsetTop = Scroll.offsetTop;
						}

						$timeout( function()
						{
							var anchor = AutoScroll.anchor();
							if ( anchor && anchor === prevAnchor ) {

								// We only scroll to the anchor if they're scrolled past it currently.
								var offset = $position.offset( anchor );
								if ( scrollElem.scrollTop() > offset.top - scrollOffsetTop ) {
									scrollElem.scrollTop( offset.top - scrollOffsetTop );
								}
							}
							else {

								scrollElem.scrollTop( 0 );
							}
						}, 0, false );
					}
				}

				// Clear out no-scroll that may be set now that we've gone to a new location.
				AutoScroll.noScroll( false );
			}

			function registerWatchers()
			{
				startWatcher = scope.$on( '$stateChangeStart', function( $event )
				{
					prevAnchor = AutoScroll.anchor();
					if ( arguments[1] ) {
						AutoScroll.pushState( $state.href( arguments[3], arguments[4] ), scrollElem );
					}
				} );

				successWatcher = scope.$on( '$stateChangeSuccess', function()
				{
					doScroll( $state.href( arguments[1], arguments[2] ) );
				} );
			}

			function deregisterWatchers()
			{
				if ( startWatcher ) {
					startWatcher();
				}

				if ( successWatcher ) {
					successWatcher();
				}
			}

			// We only activate when the directive attribute evaluates to true.
			// Or if the directive as attached with no watch value.
			scope.$watch( $parse( attrs.gjAutoScroll ), function( isActive )
			{
				if ( isActive || angular.isUndefined( isActive ) ) {
					registerWatchers();
				}
				else {
					deregisterWatchers();
				}
			} );

			scope.$on( '$destroy', function()
			{
				deregisterWatchers();
			} );
		}
	};
} );
