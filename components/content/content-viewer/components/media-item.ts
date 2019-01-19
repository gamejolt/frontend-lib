import { GJContentObject } from 'game-jolt-frontend-lib/components/content/adapter/definitions';
import { ContentOwner } from 'game-jolt-frontend-lib/components/content/content-owner';
import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { AppContentMediaItem } from '../../components/media-item/media-item';

@Component({})
export class AppContentViewerMediaItem extends Vue {
	@Prop(Object)
	data!: GJContentObject;
	@Prop(Object)
	owner!: ContentOwner;

	render(h: CreateElement) {
		return h(AppContentMediaItem, {
			props: {
				mediaItemId: this.data.attrs.id,
				isEditing: false,
				owner: this.owner,
			},
		});
	}
}