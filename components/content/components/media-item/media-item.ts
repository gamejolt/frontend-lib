import View from '!view!./media-item.html?style=./media-item.styl';
import { ContentOwner } from 'game-jolt-frontend-lib/components/content/content-owner';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { MediaItem } from '../../../media-item/media-item-model';
import { AppBaseContentComponent } from '../base/base-content-component';

@View
@Component({
	components: {
		AppBaseContentComponent,
	},
})
export class AppContentMediaItem extends Vue {
	@Prop(Number)
	mediaItemId!: number;

	@Prop(Object)
	owner!: ContentOwner;

	@Prop(Boolean)
	isEditing!: boolean;

	mediaItem: MediaItem | null = null;
	hasError = false;

	get isHydrated() {
		return !!this.mediaItem;
	}

	onRemoved() {
		this.$emit('removed');
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
}
