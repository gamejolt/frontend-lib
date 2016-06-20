import { Injectable, Inject } from 'ng-metadata/core';

/**
 * Media query breakpoints.
 */
const SM_WIDTH = 768;
const MD_WIDTH = 992;
const LG_WIDTH = 1200;

/**
 * The HiDPI breakpoint.
 * Any resolution above this breakpoint will be considered HiDPI.
 * http://bjango.com/articles/min-device-pixel-ratio/
 */
const HIDPI_BREAKPOINT = 1.5;

@Injectable()
export class Screen
{
	// This gets generated depending on if their browser has it or not.
	mq: ( mq: string ) => boolean;

	/**
	 * The actual width of the browser/screen context.
	 * Either in actual pixels, or device pixels if we can.
	 */
	width = 0;
	windowWidth = 0;

	/**
	 * The actual height of the browser/screen context.
	 * Either in actual pixels, or device pixels if we can.
	 */
	height = 0;
	windowHeight = 0;

	/**
	 * The breakpoint states.
	*/
	isXs = false;
	isSm = false;
	isMd = true;  // md is the default true state.
	isLg = false;
	breakpoint = 'md';

	isWindowXs = this.isXs;
	isWindowSm = this.isSm;
	isWindowMd = this.isMd;
	isWindowLg = this.isLg;
	windowBreakpoint = 'md';

	/**
	 * Just some silly helpers.
	 */
	isMobile = false;
	isDesktop = true;  // Desktop is default true state.

	isWindowMobile = this.isMobile;
	isWindowDesktop = this.isDesktop;

	/**
	 * The context that the Screen's dimensions are based on.
	 * If null we will just copy over the values of the "window" variants.
	 */
	context: HTMLElement = null;

	/**
	 * If it's Retina/HiDPI or not.
	 */
	isHiDpi = false;

	constructor(
		@Inject( '$rootScope' ) private $rootScope: ng.IRootScopeService,
		@Inject( '$window' ) private $window: ng.IWindowService
	)
	{
		this._generateMq();

		this.isHiDpi = this.mq( 'only screen and (-webkit-min-device-pixel-ratio: ' + HIDPI_BREAKPOINT + '), only screen and (min--moz-device-pixel-ratio: ' + HIDPI_BREAKPOINT + '), only screen and (-o-min-device-pixel-ratio: ' + HIDPI_BREAKPOINT + ' / 1), only screen and (min-resolution: ' + HIDPI_BREAKPOINT + 'dppx), only screen and (min-resolution: ' + (HIDPI_BREAKPOINT * 96) + 'dpi)' );

		// Check the breakpoints on app load.
		this._onResize();

		// Recheck on window resizes.
		// Debounce so it's not called as often.
		angular.element( $window ).on( 'resize', _.debounce( () =>
		{
			$rootScope.$apply( () =>
			{
				this._onResize();
			} );
		}, 250 ) );
	}

	private _generateMq()
	{
		/**
		 * Checks a media query breakpoint.
		 * https://github.com/paulirish/matchMedia.js/blob/master/matchMedia.js
		 */
		const matchMedia = this.$window.matchMedia || this.$window.msMatchMedia;
		if ( matchMedia ) {
			this.mq = function( mq )
			{
				return matchMedia( mq ) && matchMedia( mq ).matches || false;
			};
		}
		else {
			// For browsers that support matchMedium api such as IE 9 and webkit
			let styleMedia = (this.$window.styleMedia || this.$window.media);

			// For those that don't support matchMedium
			if ( !styleMedia ) {
				const style = this.$window.document.createElement( 'style' );
				const script = this.$window.document.getElementsByTagName( 'script' )[0];

				style.type = 'text/css';
				style.id = 'matchmediajs-test';

				script.parentNode.insertBefore( style, script );

				// 'style.currentStyle' is used by IE <= 8 and 'window.getComputedStyle' for all other browsers
				const info = ('getComputedStyle' in this.$window) && this.$window.getComputedStyle( style, null ) || style.currentStyle;

				styleMedia = {
					matchMedium: function( media )
					{
						const text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

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
	}

	/**
	 * Sets the Screen's context.
	 */
	setContext( element: ng.IRootElementService )
	{
		if ( !element ) {
			this.context = null;
		}
		else {
			this.context = element[0];
		}
	}

	/**
	 * Sets up a "spy" on the resize event.
	 * Will remember to remove the handler when the scope is destroyed.
	 * @param {angular.Scope} scope
	 * @param {function} onResize
	 */
	setResizeSpy( scope: ng.IScope, onResize: Function )
	{
		const resizeHandlerOff = this.$rootScope.$on( 'Screen.onResize', () =>
		{
			onResize();
		} );

		scope.$on( '$destroy', () =>
		{
			resizeHandlerOff();
		} );
	}

	/**
	 * Simply recalculates the breakpoint checks.
	 * Shouldn't need to call this often.
	 */
	recalculate()
	{
		this._onResize();
	}

	private _onResize()
	{
		// Get everything for the $window first.
		if ( this.mq( 'only screen and (max-width: ' + (SM_WIDTH - 1) + 'px)' ) ) {
			this.isWindowXs = true;
			this.isWindowSm = false;
			this.isWindowMd = false;
			this.isWindowLg = false;
			this.windowBreakpoint = 'xs';
		}
		else if ( this.mq( 'only screen and (min-width: ' + SM_WIDTH + 'px) and (max-width: ' + (MD_WIDTH - 1) + 'px)' ) ) {
			this.isWindowXs = false;
			this.isWindowSm = true;
			this.isWindowMd = false;
			this.isWindowLg = false;
			this.windowBreakpoint = 'sm';
		}
		else if ( this.mq( 'only screen and (min-width: ' + MD_WIDTH + 'px) and (max-width: ' + (LG_WIDTH - 1) + 'px)' ) ) {
			this.isWindowXs = false;
			this.isWindowSm = false;
			this.isWindowMd = true;
			this.isWindowLg = false;
			this.windowBreakpoint = 'md';
		}
		else if ( this.mq( 'only screen and (min-width: ' + LG_WIDTH + 'px)' ) ) {
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

		this.windowWidth = this.$window.innerWidth > 0 ? this.$window.innerWidth : this.$window.width;
		this.windowHeight = this.$window.innerHeight > 0 ? this.$window.innerHeight : this.$window.height;

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

			if ( this.width < SM_WIDTH ) {
				this.isXs = true;
				this.isSm = false;
				this.isMd = false;
				this.isLg = false;
				this.breakpoint = 'xs';
			}
			else if ( this.width >= SM_WIDTH && this.width < MD_WIDTH ) {
				this.isXs = false;
				this.isSm = true;
				this.isMd = false;
				this.isLg = false;
				this.breakpoint = 'sm';
			}
			else if ( this.width >= MD_WIDTH && this.width < LG_WIDTH ) {
				this.isXs = false;
				this.isSm = false;
				this.isMd = true;
				this.isLg = false;
				this.breakpoint = 'md';
			}
			else if ( this.width >= LG_WIDTH ) {
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
		this.$rootScope.$emit( 'Screen.onResize', this );
	}
}
