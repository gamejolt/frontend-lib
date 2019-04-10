import AppBaseContentComponent from 'game-jolt-frontend-lib/components/content/components/base/base-content-component.vue';
import { ContentOwner } from 'game-jolt-frontend-lib/components/content/content-owner';
import { MediaItem } from 'game-jolt-frontend-lib/components/media-item/media-item-model';
import AppLoading from 'game-jolt-frontend-lib/vue/components/loading/loading.vue';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

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

	get title() {
		if (this.hasCaption) {
			return this.caption;
		}
		if (this.mediaItem instanceof MediaItem) {
			return this.mediaItem.filename;
		}
		return '';
	}

	get hasCaption() {
		return this.isHydrated && this.caption;
	}

	get containerWidth() {
		return this.mediaItemWidth > 0 ? this.mediaItemWidth + 'px' : 'auto';
	}

	get containerHeight() {
		return this.mediaItemHeight > 0 ? this.mediaItemHeight + 'px' : 'auto';
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
}
