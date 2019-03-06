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

	get isHydrated() {
		return !!this.mediaItem;
	}

	onRemoved() {
		this.$emit('removed');
	}

	async mounted() {
		const hydratedData = await this.owner
			.getHydrator()
			.getData('media-item', this.mediaItemId.toString());
		// TODO: handle failure case
		this.mediaItem = new MediaItem(hydratedData);
	}
}
