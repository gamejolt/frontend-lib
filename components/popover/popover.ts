import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./popover.html';

import { Popover } from './popover.service';
import { Ruler } from '../ruler/ruler-service';
import { Screen } from '../screen/screen-service';
import { Scroll } from '../scroll/scroll.service';

// Importing animations didn't work with scoped.
require('./popover.styl');

export interface PopoverTrigger {
	el: HTMLElement;
	triggerEvent: string;
}

interface PopoverTiggerEvent extends Event {
	gjPopoverClick?: boolean;
}

@View
@Component({})
export class AppPopover extends Vue {
	@Prop(String) popoverId: string;
	@Prop(Boolean) appendToBody: boolean;
	@Prop(Boolean) triggerManually: boolean;
	@Prop(String) positionBy?: 'position' | 'offset' | 'fixed';
	@Prop(String) trackElementWidth?: string;
	@Prop({ type: String, default: 'bottom' })
	position: 'top' | 'right' | 'bottom' | 'left';
	@Prop(String) positionHorizontal?: string;
	@Prop(Boolean) hideOnStateChange: boolean;
	@Prop(Boolean) noMaxHeight: boolean;

	isVisible = false;
	isAppendedToBody = false;
	arrowLeft?: string = undefined;
	arrowTop?: string = undefined;
	popoverElem: HTMLElement;

	private transitioning: 'enter' | 'leave' | false = false;

	attachedTrigger?: PopoverTrigger;

	private context: HTMLElement | null;
	private backdropElem?: HTMLElement;

	// We use the wrapped to generate an on/off click handler.
	private hidePopoversWrapped?: any;

	readonly Screen = Screen;

	mounted() {
		// Store a reference to the inner popover since we may append it to the
		// body later and lose reference to it.
		this.popoverElem = this.$refs.popover as HTMLElement;
		this.context = document.getElementById('popover-context');

		// Track this popover.
		Popover.registerPopover(this.$router, this.popoverId, this);
	}

	destroyed() {
		// There is some times a race condition when we reload a page where it
		// re-registers the popover for the view before we have a chance to
		// deregister the old one. We check to make sure that the ID referenced
		// is this exact popover controller, otherwise we skip the
		// deregistration since it was already overriden and effectively
		// deregistered.
		if (Popover.getPopover(this.popoverId) === this) {
			Popover.deregisterPopover(this.popoverId);
		}

		// Gotta make sure to clean up after itself completey. This includes the
		// popover backdrop and what not. Forcing the remove ensures that if
		// it's been appended to the body it will still remove from the DOM.
		this.hide();
		this.remove();
	}

	// If we are attached to an on "hover" trigger, then we want need to make
	// sure to show the popover if they leave the trigger and move their mouse
	// into the popover. This way it won't hide when they move to use the
	// popover.
	onMouseEnter() {
		if (this.attachedTrigger && this.attachedTrigger.triggerEvent === 'hover') {
			this.show(this.attachedTrigger.el);
		}
	}

	onMouseLeave() {
		if (this.attachedTrigger && this.attachedTrigger.triggerEvent === 'hover') {
			this.hide();
		}
	}

	/**
	 * Register a click handler on the element to stop it from propagating
	 * to the $document click handler that closes all popovers.
	 */
	onClick(event: PopoverTiggerEvent) {
		// We set that this event originated from a popover click.
		// This will tell our global document handler that is set when the popover is showing
		// to not hide popovers.
		event.gjPopoverClick = true;

		return true;
	}

	private hidePopovers(event?: PopoverTiggerEvent) {
		// This attribute is set on click events that originate within an actual popover.
		// We don't want to close them when this happens.
		// We only close if it was clicked outside of the popover.
		if (event && event.gjPopoverClick) {
			return;
		}

		Popover.hideAll();
	}

	/**
	 * Toggle this popover.
	 */
	trigger(triggerElement: HTMLElement) {
		if (!this.isVisible) {
			this.show(triggerElement);
		} else {
			this.hide();
		}
	}

	/**
	 * Show the popover and enter it into the DOM.
	 */
	show(triggerElement: HTMLElement) {
		// If leaving we want to stop the leave and override it with the show.
		if (this.isVisible && this.transitioning !== 'leave') {
			return;
		}

		const elem = this.popoverElem;

		this.transitioning = 'enter';
		this.isVisible = true;

		this.$emit('focused');

		// Should it be appended to the body instead of where it lives
		// currently? We check this every time we need to show. We append the
		// inner popover element instead of `$el` so that we maintain the DOM
		// reference and can react on `destroyed` events and what not.
		if (this.appendToBody && !this.isAppendedToBody) {
			document.body.appendChild(elem);
			this.isAppendedToBody = true;
		} else if (!this.appendToBody && this.isAppendedToBody) {
			this.$el.appendChild(elem);
			this.isAppendedToBody = false;
		}

		const triggerWidth = triggerElement.offsetWidth;
		const triggerHeight = triggerElement.offsetHeight;
		const triggerOffset = Ruler.offset(triggerElement);

		// If we are tracking a particular element's width, then we set this popover to
		// be the same width as the element.
		// We don't track width when it's an XS screen since we do a full width popover in those cases.
		let widthElem: HTMLElement | undefined;
		if (this.trackElementWidth && !Screen.isWindowXs) {
			widthElem = document.querySelector(this.trackElementWidth) as HTMLElement | undefined;
			if (widthElem) {
				elem.style.width = widthElem.offsetWidth + 'px';
				elem.style.maxWidth = 'none';
			}
		}

		// If no element to base our width on, reset.
		if (!widthElem) {
			elem.style.maxWidth = '';
			elem.style.width = '';
		}

		const popoverWidth = Ruler.outerWidth(elem);
		const popoverHeight = Ruler.outerHeight(elem);

		// If we're appending to body, then we're positioning it relative to the whole screen.
		// If we're keeping it in place, then we position relative to the parent positioner.
		// We allow to override this logic through a param, though.
		const positionBy = this.positionBy || (this.appendToBody ? 'offset' : 'position');

		let triggerLeft: number, triggerTop: number, triggerRight: number, triggerBottom: number;
		if (positionBy === 'offset') {
			triggerLeft = triggerOffset.left;
			triggerTop = triggerOffset.top;
		} else if (positionBy === 'fixed') {
			triggerLeft = triggerOffset.left - Scroll.getScrollLeft();
			triggerTop = triggerOffset.top - Scroll.getScrollTop();
		} else {
			const triggerPos = Ruler.position(triggerElement);
			triggerLeft = triggerPos.left;
			triggerTop = triggerPos.top;
		}

		triggerRight = triggerLeft + triggerWidth;
		triggerBottom = triggerTop + triggerHeight;

		if (this.position === 'top' || this.position === 'bottom') {
			// Align to the right if the trigger is past the window mid line.
			// Always go by the trigger offset.
			if (this.positionHorizontal === 'left' || triggerOffset.left > Screen.windowWidth / 2) {
				elem.style.left = triggerRight - popoverWidth + 'px';
			} else {
				elem.style.left = triggerLeft + 'px';
			}

			if (this.position === 'bottom') {
				elem.style.top = triggerBottom + 'px';
			} else if (this.position === 'top') {
				elem.style.bottom = triggerTop + 'px';
			}
		} else if (this.position === 'left' || this.position === 'right') {
			// Align to the right if the trigger is past the window mid line.
			if (triggerTop > Screen.windowHeight / 2) {
				elem.style.top = triggerBottom - popoverHeight + 'px';
			} else {
				elem.style.top = triggerTop + 'px';
			}

			if (this.position === 'left') {
				elem.style.right = triggerLeft + 'px';
			} else if (this.position === 'right') {
				elem.style.left = triggerRight + 'px';
			}
		}

		// Align the arrow to match the center of the trigger element.
		// Unless the popover is smaller than the element, then we align to center of popover.
		// The extra spacing is for the popover element around the edges.
		// If we want to position the arrow correctly, we need to subtract half of this.
		const elementStyles = window.getComputedStyle(elem);
		if (this.position === 'top' || this.position === 'bottom') {
			const extraSpacing = elementStyles.left
				? (popoverWidth - Ruler.width(elem)) / 2 + parseFloat(elementStyles.left)
				: 0;
			this.arrowLeft =
				triggerLeft + Math.min(triggerWidth / 2, popoverWidth / 2) - extraSpacing + 'px';
		} else if (this.position === 'left' || this.position === 'right') {
			const extraSpacing = elementStyles.top
				? (popoverHeight - Ruler.height(elem)) / 2 + parseFloat(elementStyles.top)
				: 0;
			this.arrowTop =
				triggerTop + Math.min(triggerHeight / 2, popoverHeight / 2) - extraSpacing + 'px';
		}

		this.hidePopoversWrapped = (event: PopoverTiggerEvent) => this.hidePopovers(event);
		document.addEventListener('click', this.hidePopoversWrapped);

		this.backdropElem = document.createElement('div');
		this.backdropElem.className = 'popover-backdrop';
		this.backdropElem.addEventListener('click', this.hidePopoversWrapped);

		if (this.context) {
			this.context.appendChild(this.backdropElem);
		} else {
			document.body.appendChild(this.backdropElem);
		}

		this.transitioning = false;
	}

	/**
	 * Hide this element and possibly remove from the DOM.
	 */
	hide() {
		if (!this.isVisible) {
			return;
		}

		this.transitioning = 'leave';

		// We give it a short timeout for anything to cancel the transition.
		// Basically, if "show" is called within this time, we'll stop the
		// leave transition and show it.
		setTimeout(() => {
			this._hide();
		}, 100);
	}

	_hide() {
		if (this.transitioning !== 'leave') {
			return;
		}

		if (this.hidePopoversWrapped) {
			document.removeEventListener('click', this.hidePopoversWrapped);
		}

		if (this.backdropElem) {
			this.backdropElem.parentNode!.removeChild(this.backdropElem);
		}

		this.isVisible = false;
		this.transitioning = false;
	}

	private remove() {
		const elem = this.popoverElem;
		if (elem && elem.parentNode) {
			elem.parentNode.removeChild(elem);
		}
	}

	_onLeft() {
		this.$emit('blurred');
	}
}
