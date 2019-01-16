import View from '!view!./img.html';
import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { AppImgResponsive } from '../../../img/responsive/responsive';

@View
@Component({
	components: {
		AppImgResponsive,
	},
})
export class AppCommunityThumbnailImg extends Vue {
	@Prop(Community)
	community!: Community;

	get src() {
		if (!this.community.thumbnail) {
			return require('!file-loader!../default.png');
		}

		return this.community.thumbnail.mediaserver_url;
	}
}
