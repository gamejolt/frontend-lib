import View from '!view!./scroller.html?style=./scroller.styl';
import { ScrollInviewContainer } from 'game-jolt-frontend-lib/components/scroll/inview/container';
import { AppScrollInviewParent } from 'game-jolt-frontend-lib/components/scroll/inview/parent';
import SimpleBar from 'simplebar';
import 'simplebar/dist/simplebar.css';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@View
@Component({
	components: {
		AppScrollInviewParent,
	},
})
export class AppScrollScroller extends Vue {
	@Prop(Boolean)
	overlay?: boolean;

	@Prop(Boolean)
	horizontal?: boolean;

	@Prop(Boolean)
	hideScrollbar?: boolean;

	@Prop(Number)
	inviewThrottle?: number;

	@Prop(Number)
	inviewVelocity?: number;

	isMounted = GJ_IS_SSR;

	// No watching.
	_simplebar?: SimpleBar;
	_inviewContainer!: ScrollInviewContainer;
	private _isDestroyed?: boolean;

	get shouldOverlay() {
		return this.overlay && !GJ_IS_SSR;
	}

	async mounted() {
		// Don't set it up if it's already destroyed.
		if (this._isDestroyed) {
			return;
		}

		// The scrollable element will change if we are using simplebar.
		let el = this.$el;
		if (this.shouldOverlay) {
			this._simplebar = new SimpleBar(el, {
				wrapContent: false,
				scrollbarMinSize: 30,
				// Only autohide vertical scrollbars since they're easy to scroll with a
				// mouse/trackpad.
				autoHide: !this.horizontal,
			});

			el = this._simplebar.getScrollElement() as HTMLElement;
		}

		// We need to create the inview container before we can put the content
		// into the DOM. This way we can pass the container to the inview parent
		// component so that it has the correct scroller.
		this._inviewContainer = new ScrollInviewContainer(
			el,
			this.inviewThrottle,
			this.inviewVelocity
		);

		this.isMounted = true;
	}

	/**
	 * Can be used by parent components to queue a check against the inview
	 * container.
	 */
	queueInviewCheck() {
		if (this._inviewContainer) {
			this._inviewContainer.queueCheck();
		}
	}

	destroyed() {
		this._isDestroyed = true;
		this._simplebar = undefined;
	}
}
