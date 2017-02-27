import { Subject } from 'rxjs/Subject';
import { Ruler } from '../ruler/ruler-service';
import { Screen } from '../screen/screen-service';

export class Scroll
{
	static context: HTMLElement | HTMLDocument = document;
	static contextOffsetTop = 0;
	static offsetTop = 0;

	private static scrollListener: any;
	static scrollChanges = new Subject<void>();

	/**
	 * Sets the extra offset for scrolling.
	 * This can be used if there is a fixed nav on the top that we need to always offset from.
	 */
	static setOffsetTop( offset: number )
	{
		this.offsetTop = offset;
	}

	/**
	 * Sets the element that we will scroll when any scroll commands are issued.
	 */
	static setContext( element: HTMLElement | undefined)
	{
		// We just bootstrap the scroll listener once.
		if ( !this.scrollListener ) {
			this.scrollListener = () => this.scrollChanges.next();
		}

		// If we already have a context set, we gotta remove the scroll handler
		// on it.
		if ( this.context ) {
			this.context.removeEventListener( 'scroll', this.scrollListener );
		}

		if ( !element ) {
			this.context = document;
			this.contextOffsetTop = 0;
		}
		else {
			this.context = element;
			this.contextOffsetTop = Ruler.offset( element ).top;
		}

		this.context.addEventListener( 'scroll', this.scrollListener );
	}

	static getScrollTop( element?: HTMLElement | HTMLDocument ): number
	{
		if ( !element ) {
			element = this.context;
		}

		if ( element instanceof HTMLDocument ) {
			return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
		}

		return element.scrollTop;
	}

	static getScrollLeft( element?: HTMLElement | HTMLDocument ): number
	{
		if ( !element ) {
			element = this.context;
		}

		if ( element instanceof HTMLDocument ) {
			return window.scrollX || document.documentElement.scrollLeft || document.body.scrollLeft;
		}

		return element.scrollLeft;
	}

	static getScrollHeight( element?: HTMLElement | HTMLDocument ): number
	{
		if ( !element ) {
			element = this.context;
		}

		if ( element instanceof HTMLDocument ) {
			return Math.max( document.body.scrollHeight, document.documentElement.scrollHeight );
		}

		return element.scrollHeight;
	}

	/**
	 * Returns the element's offset from the top of the scroll context.
	 */
	static getElementOffsetFromContext( element: HTMLElement )
	{
		// When there is a specific scroll context element, the offset() values will be the offsets from the "document" element.
		// We have to subtract the scroll context offset from the element offset to get the correct offset within the scolling viewport.
		// We then have to negate the scrolling of the viewport since the offset value is also taking that into account.
		if ( this.context !== document ) {
			return Ruler.offset( element ).top - this.contextOffsetTop - this.offsetTop + this.getScrollTop( this.context );
		}

		// Otherwise it's the "document" element.
		// In this case it's safe to just use the element's top offset value.
		return Ruler.offset( element ).top - this.offsetTop;
	}

	/**
	 * Sets up a "spy" on the scroll event of the current scroll context.
	 * Will remember to remove the handler when the scope is destroyed.
	 * Also resets the handler when the context changes.
	 */
	static setScrollSpy( scope: any, onScroll: Function )
	{
		if ( !GJ_IS_ANGULAR ) {
			throw new Error( `You can only set a scroll spy in angular.` );
		}

		const scrollChange$ = this.scrollChanges.subscribe( () => onScroll() );
		scope.$on( '$destroy', () => scrollChange$.unsubscribe() );
	}

	/**
	 * Scrolls to the element passed in.
	 */
	static async to( input: string | number | HTMLElement, options: { animate?: boolean } = {} )
	{
		let to = 0;
		let element: HTMLElement | null = null;

		if ( typeof input === 'number' ) {
			to = input;
		}
		else if ( typeof input === 'string' ) {
			element = document.getElementById( input );
			if ( !element ) {
				throw new Error( `Couldn't find element: ${input}` );
			}
		}
		else {
			element = input;
		}

		// Just make sure that all dom compilation is over.
		await Promise.resolve();

		if ( element ) {

			// We don't scroll the full way to down to the element.
			// Do it based on the screen's height, so that mobile and stuff works well too.
			// This is because I think it's kind of annoying when the edge hits the exact top of the browser.
			if ( options.animate !== false ) {
				this.scrollToElement( element, (Screen.height * 0.1) + this.offsetTop, { animate: true } );
			}
			else {
				this.scrollToElement( element, (Screen.height * 0.1) + this.offsetTop );
			}
		}
		else {
			if ( options.animate !== false ) {
				this.scrollTo( to, { animate: true } );
			}
			else {
				this.scrollTo( to );
			}
		}
	}

	private static scrollToElement( element: HTMLElement, offset: number, options: { animate?: boolean } = {} )
	{
		let top = this.getScrollTop( this.context ) + element.getBoundingClientRect().top - offset;
		if ( this.context instanceof HTMLElement ) {
			top -= this.context.getBoundingClientRect().top;
		}

		this.scrollTo( top, options );
	}

	private static scrollTo( to: number, options: { animate?: boolean } = {} )
	{
		if ( options.animate ) {
			return this.scrollToAnimate( to );
		}

		if ( this.context instanceof HTMLDocument ) {
			window.scrollTo( window.scrollX, to );
			return;
		}

		this.context.scrollTop = to;
	}

	private static scrollToAnimate( to: number )
	{
		const startTop = this.getScrollTop( this.context );
		const deltaTop = Math.round( to - startTop );
		const duration = 500;

		const startTime = Date.now();
		let progress = 0;
		const step = ( timestamp: number ) =>
		{
			progress = timestamp - startTime;
			const percent = progress >= duration ? 1 : this.ease( progress / duration );

			this.scrollTo( startTop + Math.ceil( deltaTop * percent ) );

			if ( percent < 1 ) {
				window.requestAnimationFrame( () => step( Date.now() ) );
			}
			else {
				// do something
			}
		};

		window.requestAnimationFrame( () => step( startTime ) );
	}

	private static ease( x: number )
	{
		if ( x < 0.5 ) {
			return Math.pow( x * 2, 2 ) / 2;
		}
		return 1 - Math.pow( (1 - x) * 2, 2 ) / 2;
	}
}

// Sets the document as the scroll context.
Scroll.setContext( undefined );

// Update the scroll context's offset top when we resize.
Screen.resizeChanges.subscribe( () =>
{
	if ( Scroll.context === document ) {
		Scroll.contextOffsetTop = 0;
	}
	else {
		Scroll.contextOffsetTop = Ruler.offset( Scroll.context as HTMLElement ).top;
	}
} );

// angular.module( 'gj.Scroll' ).service( 'Scroll', function( $rootScope, $timeout, $document, $window, $position, duScrollDuration, duScrollEasing, Screen )
// {
// 	var _this = this;


// } )
// .value( 'duScrollDuration', 800 )
// .value( 'duScrollEasing', function( t )
// {
// 	// Easing functions: https://gist.github.com/gre/1650294
// 	// easeOutQuart
// 	return 1-(--t)*t*t*t;
// } );
