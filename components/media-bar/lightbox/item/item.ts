import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { Subscription } from 'rxjs/Subscription';
import View from '!view!./item.html?style=./item.styl';

import { MediaBarLightboxConfig, AppMediaBarLightbox } from '../lightbox';
import { AppJolticon } from '../../../../vue/components/jolticon/jolticon';
import { AppImgResponsive } from '../../../img/responsive/responsive';
import { AppVideoEmbed } from '../../../video/embed/embed';
import { AppSketchfabEmbed } from '../../../sketchfab/embed/embed';
import { findRequiredVueParent } from '../../../../utils/vue';
import { Screen } from '../../../screen/screen-service';

@View
@Component({
	components: {
		AppJolticon,
		AppVideoEmbed,
		AppSketchfabEmbed,
		AppImgResponsive,
	},
})
export class AppMediaBarLightboxItem extends Vue {
	@Prop(Object) item!: any;
	@Prop(Number) itemIndex!: number;
	@Prop(Number) activeIndex!: number;

	lightbox: AppMediaBarLightbox;

	isActive = false;
	isNext = false;
	isPrev = false;

	maxWidth = 0;
	maxHeight = 0;

	private resize$: Subscription | undefined;

	$refs: {
		caption: HTMLDivElement;
	};

	mounted() {
		this.lightbox = findRequiredVueParent(this, AppMediaBarLightbox);
		this.calcActive();
		this.calcDimensions();

		this.resize$ = Screen.resizeChanges.subscribe(() => this.calcDimensions());
	}

	destroyed() {
		if (this.resize$) {
			this.resize$.unsubscribe();
			this.resize$ = undefined;
		}
	}

	@Watch('activeIndex')
	activeIndexChange() {
		this.calcActive();
	}

	async calcDimensions() {
		await this.$nextTick();

		if (Screen.isXs) {
			return;
		}

		// Very fragile. Kinda lame.
		this.maxWidth = Screen.width - MediaBarLightboxConfig.buttonSize * 2;
		this.maxHeight = Screen.height - MediaBarLightboxConfig.controlsHeight * 2;

		if (this.$refs.caption) {
			this.maxHeight -= this.$refs.caption.offsetHeight;
		}

		if (this.item.media_type === 'image') {
			const dimensions = this.item.media_item.getDimensions(this.maxWidth, this.maxHeight);
			this.maxWidth = dimensions.width;
			this.maxHeight = dimensions.height;
		}
	}

	async calcActive() {
		this.isActive = this.activeIndex === this.itemIndex;
		this.isNext = this.activeIndex + 1 === this.itemIndex;
		this.isPrev = this.activeIndex - 1 === this.itemIndex;

		this.$el.classList.remove('active', 'next', 'prev');

		if (this.isActive) {
			this.$el.classList.add('active');
		} else if (this.isPrev) {
			this.$el.classList.add('prev');
		} else if (this.isNext) {
			this.$el.classList.add('next');
		}

		if (this.isActive || this.isNext || this.isPrev) {
			this.calcDimensions();
		}
	}
}
