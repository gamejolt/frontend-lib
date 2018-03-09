import 'rxjs/add/operator/throttleTime';
import { AppScrollInview } from './inview';
import { ScrollWatcher } from '../watcher.service';
import { ScrollContext, Scroll } from '../scroll.service';

/**
 * When the scroll velocity is below this minimum distance in px, we will check inview items every
 * ScrollThrottleTime. This ensures that if they're scrolling constantly, but really slowly, we'll be
 * able to do the checks even though debounce won't fire.
 */
const DefaultScrollVelocityMinimum = 2000;
const DefaultScrollThrottleTime = 300;

export class ScrollInviewContainer {
	items: AppScrollInview[] = [];

	private scrollWatcher: ScrollWatcher;
	private lastScrollTop = 0;
	private lastThrottleTime = Date.now();
	private lastScrollHeight?: number;
	private queueTimeout?: number;

	constructor(
		public context: ScrollContext,
		private throttle = DefaultScrollThrottleTime,
		private velocity = DefaultScrollVelocityMinimum
	) {
		if (GJ_IS_SSR) {
			return;
		}

		if (context instanceof HTMLDocument) {
			this.scrollWatcher = Scroll.watcher;
		} else {
			this.scrollWatcher = new ScrollWatcher(context);
		}

		this.scrollWatcher.stop.subscribe(() => this.check());

		// If we don't want a throttle, then simply watch every scroll change.
		if (this.throttle !== 0) {
			this.scrollWatcher.changes
				.throttleTime(this.throttle)
				.subscribe(() => this.onScrollThrottle());
		} else {
			this.scrollWatcher.changes.subscribe(() => this.check());
		}
	}

	private onScrollThrottle() {
		const now = Date.now();
		const scrollTop = Scroll.getScrollTop();
		const deltaDistance = scrollTop - this.lastScrollTop;
		const deltaTime = (now - this.lastThrottleTime) / 1000;
		const velocity = deltaDistance / deltaTime;

		if (Math.abs(velocity) < this.velocity) {
			this.check();
		}

		this.lastThrottleTime = now;
		this.lastScrollTop = scrollTop;
	}

	queueCheck() {
		// Since a check was queued, it means something probably changed. Let's reset the scroll
		// watcher's cached scroll changes so we get fresh data.
		this.scrollWatcher.resetScrollChange();

		if (this.queueTimeout) {
			return;
		}

		this.queueTimeout = setTimeout(() => {
			this.check();
			this.queueTimeout = undefined;
		});
	}

	check() {
		const { top, height, scrollHeight } = this.scrollWatcher.getScrollChange();

		// We only calculate the bounding box when scroll height changes. This reduces the amount of
		// reflows and what not.
		const shouldRecalc = this.lastScrollHeight !== scrollHeight;

		for (const item of this.items) {
			if (shouldRecalc) {
				item.recalcBox();
			}

			let inView = true;
			if (item.top > top + height) {
				inView = false;
			} else if (item.bottom < top) {
				inView = false;
			}

			// Update the item with its new in-view state.
			if (inView !== item.inView) {
				item.inView = inView;
			}
		}

		this.lastScrollHeight = scrollHeight;
	}
}
