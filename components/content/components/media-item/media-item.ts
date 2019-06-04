import { ResizeObserver } from 'resize-observer';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import AppLoading from '../../../../vue/components/loading/loading.vue';
import { MediaItem } from '../../../media-item/media-item-model';
import { ContentOwner } from '../../content-owner';
import AppBaseContentComponent from '../base/base-content-component.vue';

@Component({
	components: {
		AppBaseContentComponent,
		AppLoading,
	},
})
export default class AppContentMediaItem extends Vue {
	@Prop(Number)
	mediaItemId!: number;

	@Prop(Number)
	mediaItemWidth!: number;

	@Prop(Number)
	mediaItemHeight!: number;

	@Prop(String)
	caption!: string;

	@Prop(String)
	align!: string;

	@Prop(String)
	href!: string;

	@Prop(Object)
	owner!: ContentOwner;

	@Prop(Boolean)
	isEditing!: boolean;

	@Prop(Boolean)
	isDisabled!: boolean;

	mediaItem: MediaItem | null = null;
	hasError = false;
	resizeObserver!: ResizeObserver;
	computedHeight = this.mediaItemHeight;

	$refs!: {
		container: HTMLDivElement;
	};

	get title() {
		if (this.isHydrated && this.hasCaption) {
			return this.caption;
		}
		if (this.mediaItem instanceof MediaItem) {
			return this.mediaItem.filename;
		}
		return '';
	}

	get hasCaption() {
		return !!this.caption;
	}

	get containerWidth() {
		return this.mediaItemWidth > 0 ? this.mediaItemWidth + 'px' : 'auto';
	}

	get containerHeight() {
		return this.computedHeight > 0 ? this.computedHeight + 'px' : 'auto';
	}

	get isHydrated() {
		return !!this.mediaItem;
	}

	get itemAlignment() {
		switch (this.align) {
			case 'left':
				return 'flex-start';
			case 'right':
				return 'flex-end';
		}
		return 'center';
	}

	get hasLink() {
		return typeof this.href === 'string' && this.href.length > 0;
	}

	async mounted() {
		// Observe the change to the width property, the be able to instantly recompute the height.
		// We compute the height property of the element based on the computed width to be able to set a proper placeholder.
		this.resizeObserver = new ResizeObserver(() => {
			this.setHeight();
		});
		this.resizeObserver.observe(this.$refs.container);

		const hydratedData = await this.owner
			.getHydrator()
			.getData('media-item-id', this.mediaItemId.toString());
		if (hydratedData) {
			this.mediaItem = new MediaItem(hydratedData);
		} else {
			this.hasError = true;
		}
	}

	onRemoved() {
		this.$emit('removed');
	}

	onEdit() {
		// Placeholder until we want the edit function
	}

	beforeDestroy() {
		this.resizeObserver.disconnect();
	}

	setHeight() {
		const width = this.$refs.container.clientWidth;
		const relWidth = width / this.mediaItemWidth;
		this.computedHeight = this.mediaItemHeight * relWidth;
	}
}
