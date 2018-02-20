import Vue, { CreateElement } from 'vue';
import { Component, Watch, Prop } from 'vue-property-decorator';
import 'rxjs/add/operator/throttleTime';

import { Scroll } from '../scroll.service';
import { Ruler } from '../../ruler/ruler-service';

/**
 * When the scroll velocity is below this minimum distance in px, we will check inview items every
 * ScrollThrottleTime. This ensures that if they're scrolling constantly, but really slowly, we'll be
 * able to do the checks still even though debounce won't fire.
 */
const ScrollVelocityMinimum = 3000;
const ScrollThrottleTime = 1000;

// We set up a global listener instead of having each element setting up
// listeners.
let items: AppScrollInview[] = [];

if (!GJ_IS_SSR) {
	Scroll.scrollStop.subscribe(check);
	Scroll.scrollChanges.throttleTime(ScrollThrottleTime).subscribe(onScrollThrottle);
}

let lastScrollTop = 0;
let lastThrottleTime = Date.now();
function onScrollThrottle() {
	const now = Date.now();
	const scrollTop = Scroll.getScrollTop();
	const deltaDistance = scrollTop - lastScrollTop;
	const deltaTime = (now - lastThrottleTime) / 1000;
	const velocity = deltaDistance / deltaTime;

	if (Math.abs(velocity) < ScrollVelocityMinimum) {
		check();
	}

	lastThrottleTime = now;
	lastScrollTop = scrollTop;
}

let lastScrollHeight: number | undefined = undefined;
function check() {
	const { top, height, scrollHeight } = Scroll.getScrollChange();

	for (const item of items) {
		// We only calculate the bounding box when scroll height changes. This
		// reduces the amount of reflows and what not.
		if (lastScrollHeight !== scrollHeight) {
			item.recalcBox();
		}

		let inView = true;
		if (item.top > top + height) {
			inView = false;
		} else if (item.bottom < top) {
			inView = false;
		}

		if (inView !== item.inView) {
			item.inView = inView;
		}
	}

	lastScrollHeight = height;
}

let checkTimeout: number | undefined;

/**
 * Sets a timeout that will run a check some time in the future for all current
 * inview elements on screen.
 */
function queueCheck() {
	if (!checkTimeout) {
		checkTimeout = setTimeout(() => {
			check();
			checkTimeout = undefined;
		});
	}
}

@Component({})
export class AppScrollInview extends Vue {
	@Prop({ type: Number, default: 0 })
	extraPadding: number;

	inView = false;

	top: number;
	bottom: number;

	mounted() {
		items.push(this);

		// We queue up a check to see if it's in view at mount or not. We do it
		// in a timeout so that if many elements are shown at once on screen, we
		// still only do one check.
		queueCheck();
	}

	destroyed() {
		const index = items.indexOf(this);
		if (index !== -1) {
			items.splice(index, 1);
		}
	}

	@Watch('inView')
	inViewChanged() {
		if (this.inView) {
			this.$emit('inview');
		} else {
			this.$emit('outview');
		}
	}

	render(h: CreateElement) {
		return h('div', this.$slots.default);
	}

	recalcBox() {
		const offset = Ruler.offset(this.$el);
		this.top = offset.top - this.extraPadding;
		this.bottom = offset.top + offset.height + this.extraPadding;
	}
}
