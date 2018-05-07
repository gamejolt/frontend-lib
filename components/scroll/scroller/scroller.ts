import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./scroller.html?style=./scroller.styl';

import 'simplebar/dist/simplebar.css';

@View
@Component({})
export class AppScrollScroller extends Vue {
	@Prop(Boolean) overlay?: boolean;
	@Prop(Boolean) horizontal?: boolean;
	@Prop(Boolean) hideScrollbar?: boolean;

	isSimplebarBootstrapping = false;

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

		// Since we should overlay, let's bootstrap simplebar in.
		this.isSimplebarBootstrapping = true;

		import('simplebar').then(SimpleBar => {
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

			this.isSimplebarBootstrapping = false;
		});
	}

	destroyed() {
		this.isDestroyed = true;
		this.simplebar = undefined;
	}
}
