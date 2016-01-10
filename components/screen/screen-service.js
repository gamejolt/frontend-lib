angular.module( 'gj.Screen' ).service( 'Screen', function( $rootScope, $window )
{
	var _this = this;

	/**
	 * Checks a media query breakpoint.
	 * https://github.com/paulirish/matchMedia.js/blob/master/matchMedia.js
	 */
	var matchMedia = $window.matchMedia || $window.msMatchMedia;
	if ( matchMedia ) {
		this.mq = function( mq )
		{
			return matchMedia( mq ) && matchMedia( mq ).matches || false;
		}
	}
	else {
		// For browsers that support matchMedium api such as IE 9 and webkit
		var styleMedia = ($window.styleMedia || $window.media);

		// For those that don't support matchMedium
		if ( !styleMedia ) {
			var style = $window.document.createElement( 'style' );
			var script = $window.document.getElementsByTagName( 'script' )[0];
			var info = null;

			style.type = 'text/css';
			style.id = 'matchmediajs-test';

			script.parentNode.insertBefore( style, script );

			// 'style.currentStyle' is used by IE <= 8 and 'window.getComputedStyle' for all other browsers
			info = ('getComputedStyle' in $window) && $window.getComputedStyle( style, null ) || style.currentStyle;

			styleMedia = {
				matchMedium: function( media )
				{
					var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

					// 'style.styleSheet' is used by IE <= 8 and 'style.textContent' for all other browsers
					if ( style.styleSheet ) {
						style.styleSheet.cssText = text;
					}
					else {
						style.textContent = text;
					}

					// Test if media query is true or false
					return info.width === '1px';
				}
			};
		}

		this.mq = function( mq )
		{
			return styleMedia.matchMedium( mq || 'all' ) || false;
		};
	}

	/**
	 * Media query breakpoints.
	 */
	var _smWidth = 768;
	var _mdWidth = 992;
	var _lgWidth = 1200;

	/**
	 * The HiDPI breakpoint.
	 * Any resolution above this breakpoint will be considered HiDPI.
	 * http://bjango.com/articles/min-device-pixel-ratio/
	 */
	var _hiDpiBreakpoint = 1.5;

	/**
	 * The actual width of the browser/screen context.
	 * Either in actual pixels, or device pixels if we can.
	 */
	this.width = 0;
	this.windowWidth = 0;

	/**
	 * The actual height of the browser/screen context.
	 * Either in actual pixels, or device pixels if we can.
	 */
	this.height = 0;
	this.windowHeight = 0;

	/**
	 * The breakpoint states.
	 */
	this.isXs = false;
	this.isSm = false;
	this.isMd = true;  // md is the default true state.
	this.isLg = false;
	this.breakpoint = 'md';

	this.isWindowXs = this.isXs;
	this.isWindowSm = this.isSm;
	this.isWindowMd = this.isMd;
	this.isWindowLg = this.isLg;
	this.windowBreakpoint = 'md';

	/**
	 * Just some silly helpers.
	 */
	this.isMobile = false;
	this.isDesktop = true;  // Desktop is default true state.

	this.isWindowMobile = this.isMobile;
	this.isWindowDesktop = this.isDesktop;

	/**
	 * If it's Retina/HiDPI or not.
	 */
	this.isHiDpi = this.mq( 'only screen and (-webkit-min-device-pixel-ratio: ' + _hiDpiBreakpoint + '), only screen and (min--moz-device-pixel-ratio: ' + _hiDpiBreakpoint + '), only screen and (-o-min-device-pixel-ratio: ' + _hiDpiBreakpoint + ' / 1), only screen and (min-resolution: ' + _hiDpiBreakpoint + 'dppx), only screen and (min-resolution: ' + (_hiDpiBreakpoint * 96) + 'dpi)' );

	/**
	 * The context that the Screen's dimensions are based on.
	 * If null we will just copy over the values of the "window" variants.
	 */
	this.context = null;

	/**
	 * Sets the Screen's context.
	 * @param {angular.element|false} element
	 */
	this.setContext = function( element )
	{
		if ( !element ) {
			this.context = null;
		}
		else {
			this.context = element[0];
		}
	};

	/**
	 * Sets up a "spy" on the resize event.
	 * Will remember to remove the handler when the scope is destroyed.
	 * @param {angular.Scope} scope
	 * @param {function} onResize
	 */
	this.setResizeSpy = function( scope, onResize )
	{
		var resizeHandlerOff = $rootScope.$on( 'Screen.onResize', onResize );
		scope.$on( '$destroy', function()
		{
			resizeHandlerOff();
		} );
	};

	/**
	 * Simply recalculates the breakpoint checks.
	 * Shouldn't need to call this often.
	 */
	this.recalculate = function()
	{
		this._onResize();
	};

	this._onResize = function()
	{
		// Get everything for the $window first.
		if ( this.mq( 'only screen and (max-width: ' + (_smWidth - 1) + 'px)' ) ) {
			this.isWindowXs = true;
			this.isWindowSm = false;
			this.isWindowMd = false;
			this.isWindowLg = false;
			this.windowBreakpoint = 'xs';
		}
		else if ( this.mq( 'only screen and (min-width: ' + _smWidth + 'px) and (max-width: ' + (_mdWidth - 1) + 'px)' ) ) {
			this.isWindowXs = false;
			this.isWindowSm = true;
			this.isWindowMd = false;
			this.isWindowLg = false;
			this.windowBreakpoint = 'sm';
		}
		else if ( this.mq( 'only screen and (min-width: ' + _mdWidth + 'px) and (max-width: ' + (_lgWidth - 1) + 'px)' ) ) {
			this.isWindowXs = false;
			this.isWindowSm = false;
			this.isWindowMd = true;
			this.isWindowLg = false;
			this.windowBreakpoint = 'md';
		}
		else if ( this.mq( 'only screen and (min-width: ' + _lgWidth + 'px)' ) ) {
			this.isWindowXs = false;
			this.isWindowSm = false;
			this.isWindowMd = false;
			this.isWindowLg = true;
			this.windowBreakpoint = 'lg';
		}

		if ( this.isWindowXs || this.isWindowSm ) {
			this.isWindowMobile = true;
			this.isWindowDesktop = false;
		}
		else {
			this.isWindowMobile = false;
			this.isWindowDesktop = true;
		}

		this.windowWidth = $window.innerWidth > 0 ? $window.innerWidth : $window.width;
		this.windowHeight = $window.innerHeight > 0 ? $window.innerHeight : $window.height;

		// Now if we have a Screen context set, let's get settings for that.
		// Othwerise we simply use the $indow dimensions.
		if ( !this.context ) {
			this.isXs = this.isWindowXs;
			this.isSm = this.isWindowSm;
			this.isMd = this.isWindowMd;
			this.isLg = this.isWindowLg;
			this.isMobile = this.isWindowMobile;
			this.isDesktop = this.isWindowDesktop;
			this.width = this.windowWidth;
			this.height = this.windowHeight;
			this.breakpoint = this.windowBreakpoint;
		}
		else {

			// Pull dimensions from the Screen context.
			// Not sure if media queries include the scrollbar in calculation or not.
			// inner dimensions seem to not take into account any scrollbars.
			this.width = this.context.clientWidth;
			this.height = this.context.clientHeight;

			if ( this.width < _smWidth ) {
				this.isXs = true;
				this.isSm = false;
				this.isMd = false;
				this.isLg = false;
				this.breakpoint = 'xs';
			}
			else if ( this.width >= _smWidth && this.width < _mdWidth ) {
				this.isXs = false;
				this.isSm = true;
				this.isMd = false;
				this.isLg = false;
				this.breakpoint = 'sm';
			}
			else if ( this.width >= _mdWidth && this.width < _lgWidth ) {
				this.isXs = false;
				this.isSm = false;
				this.isMd = true;
				this.isLg = false;
				this.breakpoint = 'md';
			}
			else if ( this.width >= _lgWidth ) {
				this.isXs = false;
				this.isSm = false;
				this.isMd = false;
				this.isLg = true;
				this.breakpoint = 'lg';
			}

			if ( this.isXs || this.isSm ) {
				this.isMobile = true;
				this.isDesktop = false;
			}
			else {
				this.isMobile = false;
				this.isDesktop = true;
			}
		}

		// Emit an event any time we resize.
		$rootScope.$emit( 'Screen.onResize', this );
	}

	// Check the breakpoints on app load.
	this._onResize();

	// Recheck on window resizes.
	// Debounce so it's not called as often.
	angular.element( $window ).on( 'resize', _.debounce( function()
	{
		$rootScope.$apply( function()
		{
			_this._onResize();
		} );
	}, 250 ) );
} );
