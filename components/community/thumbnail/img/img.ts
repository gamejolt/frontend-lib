import View from '!view!./img.html';
import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@View
@Component({})
export class AppCommunityThumbnailImg extends Vue {
	@Prop(Community)
	community!: Community;

	get src() {
		if (!this.community.thumbnail) {
			return '';
		}

		return this.community.thumbnail.mediaserver_url;
	}
}
