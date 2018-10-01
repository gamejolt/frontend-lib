import View from '!view!./popper.html';
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { Screen } from '../screen/screen-service';
import { AppScrollInviewParent } from '../scroll/inview/parent';
import './popper.styl';

const mod: any = require('v-tooltip');

// Sync with the styles files.
const TransitionTime = 200;

let PopperIndex = 0;

@View
@Component({
	components: {
		VPopover: mod.VPopover,
		AppScrollInviewParent,
	},
})
export class AppPopper extends Vue {
	@Prop({ type: String, default: 'bottom' })
	placement!: 'top' | 'right' | 'bottom' | 'left';

	@Prop({ type: String, default: 'click' })
	trigger!: string;

	@Prop(Boolean)
	hideOnStateChange?: boolean;

	@Prop(Boolean)
	trackTriggerWidth?: boolean;

	@Prop()
	delay?: any;

	@Prop(Boolean)
	disabled?: boolean;

	@Prop(Boolean)
	show?: boolean;

	@Prop(Boolean)
	block?: boolean;

	isVisible = false;
	width = '';
	maxWidth = '';
	popperIndex = PopperIndex++;

	private stateChangeDeregister?: Function;
	private hideTimeout?: NodeJS.Timer;

	get maxHeight() {
		return Screen.height - 100 + 'px';
	}

	get popperId() {
		return 'popper-' + this.popperIndex;
	}

	get popoverInnerClass() {
		let classes = ['popper-content', 'scrollable', 'overlay-scrollbar'];
		if (this.trackTriggerWidth) {
			classes.push('-track-trigger-width');
		}
		return classes.join(' ');
	}

	mounted() {
		if (this.$router) {
			this.stateChangeDeregister = this.$router.beforeEach(
				(_to: any, _from: any, next: Function) => {
					this.stateChangeHide();
					next();
				}
			);
		}
	}

	destroyed() {
		this.clearHideTimeout();
		if (this.stateChangeDeregister) {
			this.stateChangeDeregister();
			this.stateChangeDeregister = undefined;
		}
	}

	@Emit('show')
	onShow() {
		this.clearHideTimeout();
		this.isVisible = true;

		// If we are tracking a particular element's width, then we set this popover to be the same
		// width as the element. We don't track width when it's an XS screen since we do a full
		// width popover in those cases.
		let widthElem: HTMLElement | undefined;
		if (this.trackTriggerWidth && !Screen.isWindowXs) {
			widthElem = document.querySelector('#' + this.popperId) as HTMLElement | undefined;
			if (widthElem) {
				this.width = widthElem.offsetWidth + 'px';
				this.maxWidth = 'none';
			}
		}

		// If no element to base our width on, reset.
		if (!widthElem) {
			this.maxWidth = '';
			this.width = '';
		}
	}

	onHide() {
		this.clearHideTimeout();
		this.hideTimeout = setTimeout(() => this.hideDone(), TransitionTime);
	}

	@Emit('hide')
	private hideDone() {
		this.isVisible = false;
	}

	private clearHideTimeout() {
		if (this.hideTimeout) {
			clearTimeout(this.hideTimeout);
			this.hideTimeout = undefined;
		}
	}

	// Pretty hacky, but just simulate a click on the popover to close.
	private stateChangeHide() {
		if (this.isVisible && this.hideOnStateChange) {
			this.$el.click();
		}
	}
}
