import Vue from 'vue';
import { Subscription } from 'rxjs/Subscription';
import { Component, Prop, Watch } from 'vue-property-decorator';
import * as View from '!view!./affix.html?style=./affix.styl';

import { getProvider } from '../../../utils/utils';
import { Scroll } from '../scroll.service';
import { Ruler } from '../../ruler/ruler-service';
import { Screen } from '../../screen/screen-service';

@View
@Component({})
export class AppScrollAffix extends Vue {
	@Prop({ type: String, default: 'gj-scroll-affixed' })
	className: string;

	@Prop({ type: Boolean, default: true })
	shouldAffix: boolean;
	@Prop(Number) scrollOffset?: number;

	@Prop(Number) slotId: number;

	isAffixed = false;
	placeholderHeight = 0;
	width = '';

	private container: HTMLElement;
	private loopCount = 0;
	private timeoutCancel?: NodeJS.Timer;
	private ngStateChange: any;
	private curTop: number;

	private resize$: Subscription | undefined;
	private scroll$: Subscription | undefined;

	private clickHandler = () => this.checkLoop();

	get attachedClass() {
		const className = this.className;
		return this.isAffixed ? className : undefined;
	}

	mounted() {
		this.resize$ = Screen.resizeChanges.subscribe(() => {
			// If we resized, then the element width most likely changed.
			// Pull from the placeholder which should be the source of the true width now.
			if (this.isAffixed) {
				const placeholder = this.getPlaceholder();
				if (placeholder) {
					this.width = Ruler.outerWidth(placeholder) + 'px';
				}
			}

			this.checkLoop();
		});

		this.scroll$ = Scroll.scrollChanges.subscribe(change =>
			this.checkScroll(change.top)
		);

		this.container = this.$el.getElementsByClassName(
			'scroll-affix-container'
		)[0] as HTMLElement;
		if (!this.container) {
			throw new Error(`Couldn't find container.`);
		}

		this.checkLoop();

		// // In case the click changed the page position, or changed element positions.
		document.addEventListener('click', this.clickHandler);
	}

	destroyed() {
		if (this.clickHandler) {
			document.removeEventListener('click', this.clickHandler);
		}

		if (this.ngStateChange) {
			this.ngStateChange();
		}

		if (this.timeoutCancel) {
			clearTimeout(this.timeoutCancel);
			this.timeoutCancel = undefined;
		}

		if (this.resize$) {
			this.resize$.unsubscribe();
			this.resize$ = undefined;
		}

		if (this.scroll$) {
			this.scroll$.unsubscribe();
			this.scroll$ = undefined;
		}
	}

	@Watch('shouldAffix')
	onShouldAffixChange() {
		this.check();
	}

	private getPlaceholder() {
		return this.$el.getElementsByClassName(
			'gj-scroll-affix-placeholder'
		)[0] as HTMLElement;
	}

	// This sets up a loop that syncs repeatedly for a bit.
	// This is needed if an action is done that may have triggered an animation
	// that would change height of element.
	private checkLoop() {
		this.loopCount = 0;
		if (this.timeoutCancel) {
			clearTimeout(this.timeoutCancel);
			this.timeoutCancel = undefined;
		}

		this.checkLoopTick();
	}

	private checkLoopTick() {
		this.timeoutCancel = setTimeout(() => {
			this.check();

			++this.loopCount;
			if (this.loopCount <= 6) {
				this.checkLoopTick();
			}
		}, 500);
	}

	private async check() {
		// Let the view compile.
		await this.$nextTick();

		if (this.shouldAffix) {
			let prevTop = this.curTop;
			this.curTop = this.getOffsets();

			// Only check the scroll if our top value has changed.
			if (prevTop !== this.curTop) {
				this.checkScroll();
			}
		} else {
			this.off();
		}
	}

	private getOffsets() {
		// We pull from the placeholder if it's attached.
		// If we're scrolled past, then the placeholder will have the correct position.
		let top = 0;
		if (this.isAffixed) {
			const placeholder = this.getPlaceholder();
			if (!placeholder) {
				throw new Error(`Couldn't find placeholder.`);
			}
			top = Scroll.getElementOffsetFromContext(placeholder);
		} else {
			top = Scroll.getElementOffsetFromContext(this.container);
		}

		if (this.scrollOffset) {
			top -= this.scrollOffset;
		}

		return top;
	}

	private checkScroll(offset?: number) {
		if (!this.shouldAffix) {
			return;
		}

		// Pull from the correct scroll context.
		offset = offset || Scroll.getScrollTop();

		if (!this.isAffixed && offset > this.curTop) {
			const width = Ruler.outerWidth(this.container);
			const height = Ruler.outerHeight(this.container);

			this.placeholderHeight = height;
			this.isAffixed = true;
			this.width = width + 'px';

			this.$emit('affixChanged', true);
		} else if (offset < this.curTop) {
			this.off();
		}
	}

	private off() {
		if (this.isAffixed) {
			this.isAffixed = false;
			this.width = '';

			this.$emit('affixChanged', false);
		}
	}
}
