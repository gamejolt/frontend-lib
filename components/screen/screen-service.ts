import { Subject } from 'rxjs/Subject';
import { fromEvent } from 'rxjs/observable/fromEvent';
import 'rxjs/add/operator/debounceTime';

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

// Set up the `mq` func.
let mq: ( mq: string ) => boolean;
const _window: any = window;

/**
 * Checks a media query breakpoint.
 * https://github.com/paulirish/matchMedia.js/blob/master/matchMedia.js
 */
const matchMedia = _window.matchMedia || _window.msMatchMedia;
if ( matchMedia ) {
	mq = ( _mq ) => matchMedia( _mq ) && matchMedia( _mq ).matches || false;
}
else {
	// For browsers that support matchMedium api such as IE 9 and webkit
	let styleMedia = (_window.styleMedia || _window.media);

	// For those that don't support matchMedium
	if ( !styleMedia ) {
		const style = _window.document.createElement( 'style' );
		const script = _window.document.getElementsByTagName( 'script' )[0];

		style.type = 'text/css';
		style.id = 'matchmediajs-test';

		script.parentNode.insertBefore( style, script );

		// 'style.currentStyle' is used by IE <= 8 and '_window.getComputedStyle' for all other browsers
		const info = ('getComputedStyle' in _window) && _window.getComputedStyle( style, null ) || style.currentStyle;

		styleMedia = {
			matchMedium: function( media: any )
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

	mq = ( _mq ) => styleMedia.matchMedium( _mq || 'all' ) || false;
}

export class Screen
{
	/**
	 * The actual width of the browser/screen context.
	 * Either in actual pixels, or device pixels if we can.
	 */
	static width = 0;
	static windowWidth = 0;

	/**
	 * The actual height of the browser/screen context.
	 * Either in actual pixels, or device pixels if we can.
	 */
	static height = 0;
	static windowHeight = 0;

	/**
	 * The breakpoint states.
	*/
	static isXs = false;
	static isSm = false;
	static isMd = true;  // md is the default true state.
	static isLg = false;
	static breakpoint = 'md';

	static isWindowXs = Screen.isXs;
	static isWindowSm = Screen.isSm;
	static isWindowMd = Screen.isMd;
	static isWindowLg = Screen.isLg;
	static windowBreakpoint = 'md';

	/**
	 * Just some silly helpers.
	 */
	static isMobile = false;
	static isDesktop = true;  // Desktop is default true state.

	static isWindowMobile = Screen.isMobile;
	static isWindowDesktop = Screen.isDesktop;

	/**
	 * The context that the Screen's dimensions are based on.
	 * If null we will just copy over the values of the "window" variants.
	 */
	static context: HTMLElement | null = null;

	/**
	 * If it's Retina/HiDPI or not.
	 */
	static isHiDpi = mq( 'only screen and (-webkit-min-device-pixel-ratio: ' + HIDPI_BREAKPOINT + '), only screen and (min--moz-device-pixel-ratio: ' + HIDPI_BREAKPOINT + '), only screen and (-o-min-device-pixel-ratio: ' + HIDPI_BREAKPOINT + ' / 1), only screen and (min-resolution: ' + HIDPI_BREAKPOINT + 'dppx), only screen and (min-resolution: ' + (HIDPI_BREAKPOINT * 96) + 'dpi)' );

	static resizeChanges = new Subject<void>();

	/**
	 * Sets the Screen's context.
	 */
	static setContext( element: ng.IRootElementService )
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
	 */
	static setResizeSpy( scope: any, onResize: Function )
	{
		if ( !GJ_IS_ANGULAR ) {
			throw new Error( `You can only set a resize spy in angular.` );
		}

		const resizeChange$ = this.resizeChanges.subscribe( () => onResize() );
		scope.$on( '$destroy', () => resizeChange$.unsubscribe() );
	}

	/**
	 * Simply recalculates the breakpoint checks.
	 * Shouldn't need to call this often.
	 */
	static recalculate()
	{
		this._onResize();
	}

	static async _onResize()
	{
		// This will force angular to digest if needed.
		if ( GJ_IS_ANGULAR ) {
			await Promise.resolve();
		}

		// Get everything for the window first.
		if ( mq( 'only screen and (max-width: ' + (SM_WIDTH - 1) + 'px)' ) ) {
			this.isWindowXs = true;
			this.isWindowSm = false;
			this.isWindowMd = false;
			this.isWindowLg = false;
			this.windowBreakpoint = 'xs';
		}
		else if ( mq( 'only screen and (min-width: ' + SM_WIDTH + 'px) and (max-width: ' + (MD_WIDTH - 1) + 'px)' ) ) {
			this.isWindowXs = false;
			this.isWindowSm = true;
			this.isWindowMd = false;
			this.isWindowLg = false;
			this.windowBreakpoint = 'sm';
		}
		else if ( mq( 'only screen and (min-width: ' + MD_WIDTH + 'px) and (max-width: ' + (LG_WIDTH - 1) + 'px)' ) ) {
			this.isWindowXs = false;
			this.isWindowSm = false;
			this.isWindowMd = true;
			this.isWindowLg = false;
			this.windowBreakpoint = 'md';
		}
		else if ( mq( 'only screen and (min-width: ' + LG_WIDTH + 'px)' ) ) {
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

		this.windowWidth = window.innerWidth > 0 ? window.innerWidth : (window as any)['width'];
		this.windowHeight = window.innerHeight > 0 ? window.innerHeight : (window as any)['height'];

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

		// Emit every time we resize.
		this.resizeChanges.next();
	}
}

// Check the breakpoints on app load.
Screen._onResize();

/**
 * This is used internally to check things every time window resizes.
 * We debounce this and afterwards fire the resizeChanges for everyone else.
 */
fromEvent( window, 'resize' )
	.debounceTime( 250 )
	.subscribe( () => Screen._onResize() );
