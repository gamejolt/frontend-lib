import View from '!view!./scroller.html?style=./scroller.styl';
import SimpleBar from 'simplebar';
import 'simplebar/dist/simplebar.css';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@View
@Component({})
export class AppScrollScroller extends Vue {
	@Prop(Boolean)
	overlay?: boolean;

	@Prop(Boolean)
	horizontal?: boolean;

	@Prop(Boolean)
	hideScrollbar?: boolean;

	// No watching.
	simplebar?: SimpleBar;
	private isDestroyed?: boolean;

	get shouldOverlay() {
		return this.overlay && !GJ_IS_SSR;
	}

	mounted() {
		if (!this.shouldOverlay) {
			return;
		}

		// Don't set it up if it's already destroyed.
		if (this.isDestroyed) {
			return;
		}

		this.simplebar = new SimpleBar(this.$el, {
			wrapContent: false,
			scrollbarMinSize: 30,
			// Only autohide vertical scrollbars since they're easy to scroll with a
			// mouse/trackpad.
			autoHide: !this.horizontal,
		});
	}

	destroyed() {
		this.isDestroyed = true;
		this.simplebar = undefined;
	}
}
