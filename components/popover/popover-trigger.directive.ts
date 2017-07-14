import { Directive, Inject, HostListener, Input } from 'ng-metadata/core';
import { Popover } from './popover.service';
import { PopoverTrigger } from './popover';

@Directive({
	selector: 'gj-popover-trigger',
})
export class PopoverTriggerDirective implements PopoverTrigger {
	@Input('@gjPopoverTrigger') popoverId: string;
	@Input('<') popoverTriggerDisabled = false;

	/**
	 * `click` will toggle it on/off when clicked.
	 * `hover` will show when moused over, and hide when moused out.
	 * `click-show` will only show when clicked and won't hide ever.
	 */
	@Input('@popoverTriggerEvent') triggerEvent: 'click' | 'hover' | 'click-show' = 'click';

	el: HTMLElement;

	constructor(@Inject('$element') public $element: ng.IAugmentedJQuery) {
		this.el = this.$element[0];
	}

	private getPopover() {
		return Popover.getPopover(this.popoverId);
	}

	@HostListener('click', ['$event'])
	onClick($event: JQueryEventObject) {
		if (['click', 'click-show'].indexOf(this.triggerEvent) === -1 || this.popoverTriggerDisabled) {
			return true;
		}

		const popover = this.getPopover();
		if (popover) {
			// First make sure all popovers currently showing are hidden.
			Popover.hideAll({ skip: popover });

			if (this.triggerEvent === 'click') {
				// Trigger the popover.
				// Will either hide or show depending on its status.
				popover.trigger(this.el);
			} else if (this.triggerEvent === 'click-show') {
				popover.show(this.el);
			}

			// Make sure this event doesn't bubble up to our global $document click event.
			// If we let it bubble, this popover will close.
			$event.stopPropagation();
		} else {
			return true;
		}
	}

	@HostListener('mouseenter')
	onMouseEnter() {
		if (this.triggerEvent !== 'hover' || this.popoverTriggerDisabled) {
			return true;
		}

		const popover = this.getPopover();
		if (popover) {
			popover.attachedTrigger = this;
			popover.show(this.el);
		}
	}

	@HostListener('mouseleave')
	onMouseLeave() {
		if (this.triggerEvent !== 'hover' || this.popoverTriggerDisabled) {
			return true;
		}

		const popover = this.getPopover();
		if (popover) {
			popover.attachedTrigger = this;
			popover.hide();
		}
	}
}
