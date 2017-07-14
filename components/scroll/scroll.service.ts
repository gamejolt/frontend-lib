import { Subject } from 'rxjs/Subject';
import { Ruler } from '../ruler/ruler-service';
import { Screen } from '../screen/screen-service';
import { supportsPassiveEvents } from '../../utils/detection';
import { AppAutoscrollAnchor } from './auto-scroll/anchor';

// Polyfill smooth scrolling.
if (!GJ_IS_SSR) {
	require('smoothscroll-polyfill').polyfill();
}

export interface ScrollChange {
	top: number;
	left: number;
	height: number;
	width: number;
	scrollHeight: number;
	scrollWidth: number;
}

export class Scroll {
	static shouldAutoScroll = true;
	static autoscrollAnchor?: AppAutoscrollAnchor;

	// For SSR context we have to set this to undefined. No methods should be
	// called that would use the context.
	static context: HTMLElement | HTMLDocument = typeof document !== 'undefined'
		? document
		: undefined as any;
	static contextOffsetTop = 0;
	static offsetTop = 0;

	private static scrollListener: any;
	static scrollChanges = new Subject<ScrollChange>();

	/**
	 * Sets the extra offset for scrolling. This can be used if there is a fixed
	 * nav on the top that we need to always offset from.
	 */
	static setOffsetTop(offset: number) {
		this.offsetTop = offset;
	}

	/**
	 * Sets the element that we will scroll when any scroll commands are issued.
	 */
	static setContext(element: HTMLElement | undefined) {
		// We just bootstrap the scroll listener once.
		if (!this.scrollListener) {
			this.scrollListener = () =>
				this.scrollChanges.next({
					top: this.getScrollTop(),
					left: this.getScrollLeft(),
					height: this.getScrollWindowHeight(),
					width: this.getScrollWindowWidth(),
					scrollHeight: Scroll.getScrollHeight(),
					scrollWidth: Scroll.getScrollWidth(),
				});
		}

		// If we already have a context set, we gotta remove the scroll handler
		// on it.
		if (this.context) {
			this.context.removeEventListener('scroll', this.scrollListener);
		}

		if (!element) {
			this.context = document;
			this.contextOffsetTop = 0;
		} else {
			this.context = element;
			this.contextOffsetTop = Ruler.offset(element).top;
		}

		this.context.addEventListener(
			'scroll',
			this.scrollListener,
			// TODO: Fix once TS has this type def.
			supportsPassiveEvents ? { passive: true } as any : false
		);
	}

	static getScrollTop(element?: HTMLElement | HTMLDocument): number {
		if (!element) {
			element = this.context;
		}

		if (element instanceof HTMLDocument) {
			return (
				window.scrollY ||
				document.documentElement.scrollTop ||
				document.body.scrollTop
			);
		}

		return element.scrollTop;
	}

	static getScrollLeft(element?: HTMLElement | HTMLDocument): number {
		if (!element) {
			element = this.context;
		}

		if (element instanceof HTMLDocument) {
			return (
				window.scrollX ||
				document.documentElement.scrollLeft ||
				document.body.scrollLeft
			);
		}

		return element.scrollLeft;
	}

	static getScrollHeight(element?: HTMLElement | HTMLDocument): number {
		if (!element) {
			element = this.context;
		}

		if (element instanceof HTMLDocument) {
			return Math.max(
				document.body.scrollHeight,
				document.documentElement.scrollHeight
			);
		}

		return element.scrollHeight;
	}

	static getScrollWidth(element?: HTMLElement | HTMLDocument): number {
		if (!element) {
			element = this.context;
		}

		if (element instanceof HTMLDocument) {
			return Math.max(
				document.body.scrollWidth,
				document.documentElement.scrollWidth
			);
		}

		return element.scrollWidth;
	}

	static getScrollWindowHeight(element?: HTMLElement | HTMLDocument): number {
		if (!element) {
			element = this.context;
		}

		return element === document
			? window.innerHeight
			: (element as HTMLElement).clientHeight;
	}

	static getScrollWindowWidth(element?: HTMLElement | HTMLDocument): number {
		if (!element) {
			element = this.context;
		}

		return element === document
			? window.innerWidth
			: (element as HTMLElement).clientWidth;
	}

	/**
	 * Returns the element's offset from the top of the scroll context.
	 */
	static getElementOffsetFromContext(element: HTMLElement) {
		// When there is a specific scroll context element, the offset() values
		// will be the offsets from the "document" element. We have to subtract
		// the scroll context offset from the element offset to get the correct
		// offset within the scolling viewport. We then have to negate the
		// scrolling of the viewport since the offset value is also taking that
		// into account.
		if (this.context !== document) {
			return (
				Ruler.offset(element).top -
				this.contextOffsetTop -
				this.offsetTop +
				this.getScrollTop(this.context)
			);
		}

		// Otherwise it's the "document" element. In this case it's safe to just
		// use the element's top offset value.
		return Ruler.offset(element).top - this.offsetTop;
	}

	/**
	 * Scrolls to the element passed in.
	 */
	static async to(
		input: string | number | HTMLElement,
		options: { animate?: boolean } = {}
	) {
		let to = 0;
		let element: HTMLElement | null = null;

		if (options.animate === undefined) {
			options.animate = true;
		}

		if (typeof input === 'number') {
			to = input;
		} else if (typeof input === 'string') {
			element = document.getElementById(input);
			if (!element) {
				throw new Error(`Couldn't find element: ${input}`);
			}
		} else {
			element = input;
		}

		// Just make sure that all dom compilation is over.
		setTimeout(() => {
			if (element) {
				// We don't scroll the full way to down to the element. Do it
				// based on the screen's height, so that mobile and stuff works
				// well too. This is because I think it's kind of annoying when
				// the edge hits the exact top of the browser.
				this.scrollToElement(
					element,
					Screen.height * 0.1 + this.offsetTop,
					options
				);
			} else {
				this.scrollTo(to, options);
			}
		}, 20);
	}

	private static scrollToElement(
		element: HTMLElement,
		offset: number,
		options: { animate?: boolean } = {}
	) {
		let top =
			this.getScrollTop(this.context) +
			element.getBoundingClientRect().top -
			offset;
		if (this.context instanceof HTMLElement) {
			top -= this.context.getBoundingClientRect().top;
		}

		this.scrollTo(top, options);
	}

	private static scrollTo(to: number, options: { animate?: boolean } = {}) {
		let el = this.context instanceof HTMLDocument ? window : this.context;

		el.scrollTo({ top: to, behavior: options.animate ? 'smooth' : 'auto' });
	}
}

if (!GJ_IS_SSR) {
	// Sets the document as the scroll context.
	Scroll.setContext(undefined);

	// Update the scroll context's offset top when we resize.
	Screen.resizeChanges.subscribe(() => {
		if (Scroll.context === document) {
			Scroll.contextOffsetTop = 0;
		} else {
			Scroll.contextOffsetTop = Ruler.offset(Scroll.context as HTMLElement).top;
		}
	});
}
