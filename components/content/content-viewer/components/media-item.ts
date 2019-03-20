import { ContentObject } from 'game-jolt-frontend-lib/components/content/content-object';
import { ContentOwner } from 'game-jolt-frontend-lib/components/content/content-owner';
import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { AppContentMediaItem } from '../../components/media-item/media-item';

@Component({})
export class AppContentViewerMediaItem extends Vue {
	@Prop(ContentObject)
	data!: ContentObject;
	@Prop(Object)
	owner!: ContentOwner;

	render(h: CreateElement) {
		return h(AppContentMediaItem, {
			props: {
				mediaItemId: this.data.attrs.id,
				mediaItemWidth: this.data.attrs.width,
				mediaItemHeight: this.data.attrs.height,
				caption: this.data.attrs.caption,
				align: this.data.attrs.align,
				isEditing: false,
				owner: this.owner,
			},
		});
	}
}
