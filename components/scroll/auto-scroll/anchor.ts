import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Scroll } from '../scroll.service';
import { EventBus } from '../../event-bus/event-bus.service';
import { Ruler } from '../../ruler/ruler-service';

@Component({})
export class AppAutoscrollAnchor extends Vue {
	/**
	 * We can't get the scroll top during the actual scroll behavior because
	 * DOM elements may no longer be in view which could affect scroll pos. We
	 * record the current scroll here before the route change so it's correct.
	 */
	scrollTo? = 0;

	private scrollFunc?: Function;

	mounted() {
		Scroll.autoscrollAnchor = this;

		EventBus.on(
			'routeChangeBefore',
			(this.scrollFunc = () => {
				const recordedScroll = Scroll.getScrollTop();

				// We only scroll to the anchor if they're scrolled past it currently.
				const offset = Ruler.offset(this.$el);
				if (recordedScroll > offset.top - Scroll.offsetTop) {
					// Scroll to the anchor.
					this.scrollTo = offset.top - Scroll.offsetTop;
				} else {
					// Don't scroll since they're above the anchor.
					this.scrollTo = undefined;
				}
			})
		);
	}

	destroyed() {
		Scroll.autoscrollAnchor = undefined;

		if (this.scrollFunc) {
			EventBus.off('routeChangeBefore', this.scrollFunc);
			this.scrollFunc = undefined;
		}
	}

	render(h: Vue.CreateElement) {
		return h('div', this.$slots.default);
	}
}
