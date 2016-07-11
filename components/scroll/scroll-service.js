angular.module( 'gj.Scroll' ).service( 'Scroll', function( $rootScope, $timeout, $document, $window, $position, duScrollDuration, duScrollEasing, Screen )
{
	var _this = this;

	this.context = $document;
	this.contextOffsetTop = 0;
	this.offsetTop = 0;

	/**
	 * Sets the extra offset for scrolling.
	 * This can be used if there is a fixed nav on the top that we need to always offset from.
	 */
	this.setOffsetTop = function( offset )
	{
		this.offsetTop = offset;
	};

	/**
	 * Sets the element that we will scroll when any scroll commands are issued.
	 * @param {angular.element|false} element
	 */
	this.setContext = function( element )
	{
		if ( !element ) {
			this.context = $document;
			this.contextOffsetTop = 0;
		}
		else {
			this.context = element;
			this.contextOffsetTop = $position.offset( element ).top;
		}
	};

	/**
	 * Returns the element's offset from the top of the scroll context.
	 * @param {angular.element} element
	 */
	this.getElementOffsetFromContext = function( element )
	{
		// When there is a specific scroll context element, the offset() values will be the offsets from the "document" element.
		// We have to subtract the scroll context offset from the element offset to get the correct offset within the scolling viewport.
		// We then have to negate the scrolling of the viewport since the offset value is also taking that into account.
		if ( this.context !== $document ) {
			return $position.offset( element ).top - this.contextOffsetTop - this.offsetTop + this.context.duScrollTop();
		}

		// Otherwise it's the "document" element.
		// In this case it's safe to just use the element's top offset value.
		return $position.offset( element ).top - this.offsetTop;
	};

	/**
	 * Sets up a "spy" on the scroll event of the current scroll context.
	 * Will remember to remove the handler when the scope is destroyed.
	 * Also resets the handler when the context changes.
	 * @param {angular.Scope} scope
	 * @param {function} onScroll
	 */
	this.setScrollSpy = function( scope, onScroll )
	{
		// When scroll context changes (or the first fetch), attach/reattach the onScroll event.
		// We pull from the Scroll service's context.
		// This allows us to always be watching the correct and current context.
		var scrollContext = null;
		scope.$watch( function()
		{
			return _this.context;
		},
		function( newContext )
		{
			// If there was a scroll context already, we have to detach the onScroll from it.
			if ( scrollContext ) {
				scrollContext.off( 'scroll', onScroll );
			}

			scrollContext = newContext;
			scrollContext.on( 'scroll', onScroll );
		} );

		// When scope is destroyed, clean up the onScroll.
		scope.$on( '$destroy', function()
		{
			if ( scrollContext ) {
				scrollContext.off( 'scroll', onScroll );
			}
		} );
	};

	/**
	 * Scrolls to the element passed in.
	 * @param {angular.element} element
	 */
	this.to = function( input, options )
	{
		options = options || {};
		var to = 0;
		var element = null;

		if ( angular.isNumber( input ) ) {
			to = input;
		}
		else if ( !angular.isElement( input ) ) {
			element = angular.element( $window.document.getElementById( input ) );
		}
		else {
			element = input;
		}

		// Just make sure that all dom compilation is over.
		// Note that we don't do a digest after this since we're just changing browser scroll position.
		$timeout( function()
		{
			if ( element ) {

				// We don't scroll the full way to down to the element.
				// Do it based on the screen's height, so that mobile and stuff works well too.
				// This is because I think it's kind of annoying when the edge hits the exact top of the browser.
				if ( options.animate !== false ) {
					_this.context.duScrollToElement( element, (Screen.height * 0.1) + _this.offsetTop, duScrollDuration, duScrollEasing );
				}
				else {
					_this.context.duScrollToElement( element, (Screen.height * 0.1) + _this.offsetTop );
				}
			}
			else {
				if ( options.animate !== false ) {
					_this.context.duScrollTop( to, duScrollDuration, duScrollEasing );
				}
				else {
					_this.context.duScrollTop( to );
				}
			}

		}, 0, false );
	};

	// Update the scroll context's offset top when we resize.
	Screen.setResizeSpy( $rootScope, function()
	{
		if ( _this.context == $document ) {
			_this.contextOffsetTop = 0;
		}
		else {
			_this.contextOffsetTop = $position.offset( _this.context ).top;
		}
	} );
} )
.value( 'duScrollDuration', 800 )
.value( 'duScrollEasing', function( t )
{
	// Easing functions: https://gist.github.com/gre/1650294
	// easeOutQuart
	return 1-(--t)*t*t*t;
} );
