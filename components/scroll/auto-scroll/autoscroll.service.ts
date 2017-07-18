import VueRouter from 'vue-router';
import { Scroll } from '../scroll.service';

/**
 * Returns the scroll position but also sets up a timeout to enforce the scroll
 * position. Browsers for some reason scroll randomly through the vue-router
 * scroll behavior. It's always slightly off. Scrolling again in the browser's
 * next tick seems to solve this in most cases.
 */
function scroll(pos: { x: number; y: number }) {
	setTimeout(() => {
		window.scrollTo(pos.x, pos.y);
	}, 0);
	return pos;
}

export function initScrollBehavior() {
	// Should tell the browser that we want to handle our own scrolling.
	if (!GJ_IS_SSR) {
		if ('scrollRestoration' in history) {
			history.scrollRestoration = 'manual';
		}
	}

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

		if (savedPosition) {
			return scroll(savedPosition);
		}

		// If there's an anchor, then we want to either scroll to the anchor's
		// spot, or we want to leave the scroll as is.
		const anchor = Scroll.autoscrollAnchor;
		if (anchor) {
			if (anchor.scrollTo) {
				return scroll({
					x: 0,
					y: anchor.scrollTo,
				});
			} else {
				return undefined;
			}
		}

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
