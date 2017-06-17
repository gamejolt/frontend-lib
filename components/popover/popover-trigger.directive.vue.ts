import Vue from 'vue';
import { Popover } from './popover.service';
import { PopoverTrigger } from './popover';
import 'core-js/es6/map';

const registeredDirectives = new Map<HTMLElement, VuePopoverTrigger>();

class VuePopoverTrigger implements PopoverTrigger {
	public disabled = false;

	constructor(
		public el: HTMLElement,
		public popoverId: string,
		public triggerEvent: string
	) {
		el.addEventListener('click', e => this.click(e));
		el.addEventListener('mouseenter', () => this.mouseenter());
		el.addEventListener('mouseleave', () => this.mouseleave());
	}

	click(e: Event) {
		if (
			['click', 'click-show'].indexOf(this.triggerEvent) === -1 ||
			this.disabled
		) {
			return true;
		}

		const popover = Popover.getPopover(this.popoverId);
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
			e.stopPropagation();
		} else {
			return true;
		}
	}

	mouseenter() {
		if (this.triggerEvent !== 'hover' || this.disabled) {
			return true;
		}

		const popover = Popover.getPopover(this.popoverId);
		if (popover) {
			popover.attachedTrigger = this;
			popover.show(this.el);
		}
	}

	mouseleave() {
		if (this.triggerEvent !== 'hover' || this.disabled) {
			return true;
		}

		const popover = Popover.getPopover(this.popoverId);
		if (popover) {
			popover.attachedTrigger = this;
			popover.hide();
		}
	}
}

function getPopoverId(binding: Vue.VNodeDirective): string {
	return typeof binding.value === 'string' ? binding.value : binding.value.id;
}

function getTriggerEvent(binding: Vue.VNodeDirective) {
	let triggerEvent = 'click';
	if (binding.modifiers['hover']) {
		triggerEvent = 'hover';
	} else if (binding.modifiers['click-show']) {
		triggerEvent = 'click-show';
	} else if (typeof binding.value === 'object' && binding.value.event) {
		triggerEvent = binding.value.event;
	}

	return triggerEvent;
}

function getDisabled(binding: Vue.VNodeDirective): boolean {
	return typeof binding.value === 'string' ? false : binding.value.disabled;
}

export const AppPopoverTrigger: Vue.DirectiveOptions = {
	inserted(el, binding) {
		const trigger = new VuePopoverTrigger(
			el,
			getPopoverId(binding),
			getTriggerEvent(binding)
		);
		trigger.disabled = getDisabled(binding);

		registeredDirectives.set(el, trigger);
	},
	update(el: HTMLImageElement, binding) {
		if (binding.value !== binding.oldValue) {
			const trigger = registeredDirectives.get(el);
			if (trigger) {
				trigger.popoverId = getPopoverId(binding);
				trigger.triggerEvent = getTriggerEvent(binding);
				trigger.disabled = getDisabled(binding);
			}
		}
	},
	unbind(el) {
		const trigger = registeredDirectives.get(el);
		if (trigger) {
			registeredDirectives.delete(el);
		}
	},
};
