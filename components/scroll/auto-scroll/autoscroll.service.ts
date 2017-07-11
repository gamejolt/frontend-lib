import VueRouter from 'vue-router';
import { Scroll } from '../scroll.service';

export interface AutoscrollState {
	key: any;
	scroll: number;
}

export function initScrollBehavior() {
	// Should tell the browser that we want to handle our own scrolling.
	if (!GJ_IS_SSR) {
		if ('scrollRestoration' in history) {
			history.scrollRestoration = 'manual';
		}
	}

	// let prevAnchor: HTMLElement | undefined;

	return function scrollBehavior(
		to: VueRouter.Route,
		_from: VueRouter.Route,
		savedPosition?: { x: number; y: number }
	) {
		// Skip one auto scroll trigger.
		if (!Scroll.shouldAutoScroll) {
			Scroll.shouldAutoScroll = true;
			return undefined;
		}

		if (to.meta.noAutoScroll) {
			return undefined;
		}

		if (savedPosition) {
			// Browsers for some reason scroll randomly through the vue-router
			// scroll behavior. It's always slightly off. Scrolling again in
			// the browser's next tick seems to solve this in most cases.
			// blah = false;
			// window.addEventListener('scroll', unblah);
			setTimeout(() => {
				window.scrollTo(savedPosition.x, savedPosition.y);
			}, 0);
			return savedPosition;
		}

		// const anchor = Scroll.autoscrollAnchor;

		// if ( anchor && anchor === prevAnchor ) {

		// 	console.log( 'same anchor', anchor );

		// 	// We only scroll to the anchor if they're scrolled past it currently.
		// 	const offset = Ruler.offset( anchor );
		// 	console.log( offset.top, Scroll.getScrollTop(), Scroll.offsetTop );
		// 	if ( Scroll.getScrollTop() > offset.top - Scroll.offsetTop ) {
		// 		console.log( 'whaaaaaat' );
		// 		return {
		// 			x: 0,
		// 			y: offset.top,
		// 		};
		// 	}

		// 	return undefined;
		// }

		// prevAnchor = anchor;

		if (to.hash) {
			return {
				selector: to.hash,
			};
		}

		return {
			x: 0,
			y: 0,
		};
	};
}

export class Autoscroll {
	private static states: AutoscrollState[] = [];

	static height: string | null = null;

	static routeChange(to: VueRouter.Route, from: VueRouter.Route) {
		const scroll = Scroll.getScrollTop();
		// this.prevAnchor = Scroll.autoscrollAnchor;

		const fromState = this.getState(from.fullPath);
		if (fromState) {
			fromState.scroll = scroll;
			console.log('modify state', fromState);
		} else {
			this.states.push({
				key: from.fullPath,
				scroll,
			});

			console.log('add new state', this.states);
		}

		const toState = this.getState(to.fullPath);
		if (toState && toState.scroll) {
			this.height = toState.scroll + 'px';
		}
	}

	private static getState(key: any) {
		console.log('try to get state', key);
		return this.states.find(item => item.key === key);
	}
}
