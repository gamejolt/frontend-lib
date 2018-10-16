import View from '!view!./popper.html?style=./popper-content.styl';
import { AppBackdrop } from 'game-jolt-frontend-lib/components/backdrop/backdrop';
import { Backdrop } from 'game-jolt-frontend-lib/components/backdrop/backdrop.service';
import { Popper } from 'game-jolt-frontend-lib/components/popper/popper.service';
import { AppScrollScroller } from 'game-jolt-frontend-lib/components/scroll/scroller/scroller';
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { Screen } from '../screen/screen-service';
import './popper.styl';

const mod: any = require('v-tooltip');

// Sync with the styles files.
const TransitionTime = 200;

let PopperIndex = 0;

@View
@Component({
	components: {
		VPopover: mod.VPopover,
		AppScrollScroller,
	},
})
export class AppPopper extends Vue {
	@Prop({ type: String, default: 'bottom' })
	placement!: 'top' | 'right' | 'bottom' | 'left';

	@Prop({ type: String, default: 'click' })
	trigger!: 'click' | 'hover' | 'manual';

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

	@Prop({ type: Boolean, default: true })
	autoHide!: boolean;

	@Prop(Boolean)
	block?: boolean;

	@Prop(String)
	openGroup?: string;

	$refs!: {
		popover: any;
	};

	isVisible = false;
	width = '';
	maxWidth = '';
	popperIndex = PopperIndex++;

	private hideTimeout?: NodeJS.Timer;
	private mobileBackdrop: AppBackdrop | null = null;

	get maxHeight() {
		return Screen.height - 100 + 'px';
	}

	get popperId() {
		return 'popper-' + this.popperIndex;
	}

	get popoverInnerClass() {
		let classes = ['popper-content'];
		if (this.trackTriggerWidth) {
			classes.push('-track-trigger-width');
		}
		return classes.join(' ');
	}

	mounted() {
		Popper.registerPopper(this.$router, this);
	}

	destroyed() {
		Popper.deregisterPopper(this);
		this.clearHideTimeout();
	}

	hide() {
		this.$refs.popover.hide();
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

		if (Screen.isXs && !this.mobileBackdrop) {
			this.mobileBackdrop = Backdrop.push({ className: 'popper-backdrop' });
		}
	}

	onHide() {
		this.clearHideTimeout();
		this.hideTimeout = setTimeout(() => this.hideDone(), TransitionTime);

		if (Screen.isXs && this.mobileBackdrop) {
			Backdrop.remove(this.mobileBackdrop);
			this.mobileBackdrop = null;
		}
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
}
