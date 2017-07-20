import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import * as View from '!view!./fade-collapse.html?style=./fade-collapse.styl';

import { Environment } from '../environment/environment.service';
import { Scroll } from '../scroll/scroll.service';
import { Screen } from '../screen/screen-service';

const ExtraCollapsePadding = 200;

/**
 * If the collapsed version would only leave this much pixels to expand it won't
 * collapse.
 */
const Threshold = 50;

@View
@Component({})
export class AppFadeCollapse extends Vue {
	@Prop(Number) collapseHeight: number;
	@Prop(Boolean) isOpen?: boolean;

	private isPrimed = false;
	private isCollapsed = false;
	private frameRequestHandle?: number = undefined;
	private isRequired = false;

	async mounted() {
		// No need to do anything if prerendering.
		// We want to show all the content.
		if (Environment.isPrerender) {
			return;
		}

		// Let it compile DOM.
		await this.$nextTick();

		// Take threshold into account only if our collapse height is big enough
		// for threshold to matter.
		const threshold = this.collapseHeight > Threshold * 2 ? Threshold : 0;

		if (this.collapseHeight && this.$el.scrollHeight - threshold > this.collapseHeight) {
			this.isRequired = true;
		}

		this.$emit('require-change', this.isRequired);

		if (this.isRequired && !this.isOpen) {
			this.collapse();
		}
	}

	@Watch('isOpen')
	isOpenChanged() {
		if (!this.isRequired) {
			return;
		}

		if (this.isOpen) {
			this.expand();
		} else {
			this.collapse();
		}

		this.isPrimed = true;
	}

	expand() {
		this.isCollapsed = false;
		this.$el.style.maxHeight = this.$el.scrollHeight + 'px';
	}

	collapse() {
		this.isCollapsed = true;
		this.$el.style.maxHeight = this.collapseHeight + 'px';

		if (this.isPrimed) {
			// We will scroll to the bottom of the element minus some extra padding.
			// This keeps the element in view a bit.
			const scrollTo =
				Scroll.getElementOffsetFromContext(this.$el) + this.collapseHeight - ExtraCollapsePadding;

			// Only if we're past where we would scroll.
			if (Scroll.getScrollTop() > scrollTo) {
				// If we're on a tiny screen, don't animate the scroll.
				// Just set it and move on.
				if (Screen.isXs) {
					Scroll.to(scrollTo, { animate: false });
				} else {
					// Otherwise set up a scroll animation to follow the bottom of the element as it collapses.
					this.setupScrollAnim();
				}
			}
		}
	}

	setupScrollAnim() {
		// Start the loop.
		this.frameRequestHandle = window.requestAnimationFrame(() => this.animStep());
	}

	private animStep() {
		// Bottom of element from the scroll context top.
		// We then subtract some padding so that they still see some of the element while scrolling.
		const curPos =
			Scroll.getElementOffsetFromContext(this.$el) + this.$el.offsetHeight - ExtraCollapsePadding;

		// Only scroll if we have to.
		// This will allow the element to collapse freely until our marker would go out of view.
		// Then we scroll.
		if (Scroll.getScrollTop() > curPos) {
			Scroll.to(curPos, { animate: false });
		}

		// Request another frame to loop again.
		this.frameRequestHandle = window.requestAnimationFrame(() => this.animStep());
	}

	// This gets called after any of our maxHeight transitions.
	afterTransition() {
		// If we are doing the collapse scroll animation, then we can stop the
		// animation handler.
		if (this.frameRequestHandle) {
			window.cancelAnimationFrame(this.frameRequestHandle);
			this.frameRequestHandle = undefined;
		}
	}
}
