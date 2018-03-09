import Vue from 'vue';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/sampleTime';
import { Component, Prop, Watch } from 'vue-property-decorator';
import View from '!view!./affix.html?style=./affix.styl';

import { Scroll } from '../scroll.service';
import { Ruler } from '../../ruler/ruler-service';
import { Screen } from '../../screen/screen-service';

/**
 * Wait this long between scroll checks.
 */
const ScrollSampleTime = 500;

@View
@Component({})
export class AppScrollAffix extends Vue {
	@Prop({ type: String, default: 'gj-scroll-affixed' })
	className: string;

	@Prop({ type: Boolean, default: true })
	shouldAffix: boolean;

	@Prop(Number) scrollOffset?: number;

	isAffixed = false;
	placeholderHeight = 0;
	width = '';

	private refreshLoopCount = 0;
	private timeoutCancel?: NodeJS.Timer;
	private curOffset: number;

	private resize$: Subscription | undefined;
	private scroll$: Subscription | undefined;
	private clickHandler: EventListener;

	$refs: {
		container: HTMLElement;
		placeholder: HTMLElement;
	};

	get attachedClass() {
		const className = this.className;
		return this.isAffixed ? className : undefined;
	}

	mounted() {
		// In case the click changed the page position, or changed element positions.
		this.clickHandler = () => this.refreshOffsetLoop();
		document.addEventListener('click', this.clickHandler);

		// If we resized, then the element dimensions most likely changed.
		this.resize$ = Screen.resizeChanges.subscribe(() => {
			// Pull from the placeholder which should be the source of the true width now.
			if (this.isAffixed) {
				const placeholder = this.$refs.placeholder;
				if (placeholder) {
					this.width = Ruler.outerWidth(placeholder) + 'px';
				}
			}

			this.refreshOffsetLoop();
		});

		this.scroll$ = Scroll.watcher.changes.sampleTime(ScrollSampleTime).subscribe(() => {
			const { top } = Scroll.watcher.getScrollChange();
			this.checkScroll(top);
		});
		this.refreshOffsetLoop();
	}

	destroyed() {
		if (this.clickHandler) {
			document.removeEventListener('click', this.clickHandler);
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
		this.refreshOffset();
	}

	// This sets up a loop that syncs repeatedly for a bit.
	// This is needed if an action is done that may have triggered an animation
	// that would change height of element.
	private refreshOffsetLoop() {
		this.refreshLoopCount = 0;
		if (this.timeoutCancel) {
			clearTimeout(this.timeoutCancel);
			this.timeoutCancel = undefined;
		}

		this.refreshOffsetLoopTick();
	}

	private refreshOffsetLoopTick() {
		this.timeoutCancel = setTimeout(() => {
			this.refreshOffset();

			++this.refreshLoopCount;
			if (this.refreshLoopCount <= 6) {
				this.refreshOffsetLoopTick();
			}
		}, 500);
	}

	private async refreshOffset() {
		// Let the view compile.
		await this.$nextTick();

		if (this.shouldAffix) {
			let prevTop = this.curOffset;
			this.curOffset = this.getOffset();

			// Only check the scroll if our top value has changed.
			if (prevTop !== this.curOffset) {
				this.checkScroll();
			}
		} else {
			this.off();
		}
	}

	private getOffset() {
		// We pull from the placeholder if it's attached.
		// If we're scrolled past, then the placeholder will have the correct position.
		let top = 0;
		if (this.isAffixed) {
			const placeholder = this.$refs.placeholder;
			if (!placeholder) {
				throw new Error(`Couldn't find placeholder.`);
			}
			top = Scroll.getElementOffsetFromContext(placeholder);
		} else {
			top = Scroll.getElementOffsetFromContext(this.$refs.container);
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

		if (!this.isAffixed && offset > this.curOffset) {
			const width = Ruler.outerWidth(this.$refs.container);
			const height = Ruler.outerHeight(this.$refs.container);

			this.placeholderHeight = height;
			this.isAffixed = true;
			this.width = width + 'px';

			this.$emit('change', true);
		} else if (offset < this.curOffset) {
			this.off();
		}
	}

	private off() {
		if (this.isAffixed) {
			this.isAffixed = false;
			this.width = '';

			this.$emit('change', false);
		}
	}
}
