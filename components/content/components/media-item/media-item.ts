import View from '!view!./media-item.html?style=./media-item.styl';
import { ContentOwner } from 'game-jolt-frontend-lib/components/content/content-owner';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { AppLoading } from '../../../../vue/components/loading/loading';
import { MediaItem } from '../../../media-item/media-item-model';
import { AppBaseContentComponent } from '../base/base-content-component';

@View
@Component({
	components: {
		AppBaseContentComponent,
		AppLoading,
	},
})
export class AppContentMediaItem extends Vue {
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

	@Prop(Object)
	owner!: ContentOwner;

	@Prop(Boolean)
	isEditing!: boolean;

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
