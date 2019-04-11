import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import AppLoading from '../../../../../vue/components/loading/loading.vue';
import AppCard from '../../../../card/card.vue';
import { Community } from '../../../../community/community.model';
import AppCommunityJoinWidget from '../../../../community/join-widget/join-widget.vue';
import AppCommunityThumbnailImg from '../../../../community/thumbnail/img/img.vue';
import { AppTheme } from '../../../../theme/theme';
import { ContentHydrator } from '../../../content-hydrator';

@Component({
	components: {
		AppCard,
		AppLoading,
		AppTheme,
		AppCommunityThumbnailImg,
		AppCommunityJoinWidget,
	},
})
export default class AppContentEmbedCommunityEmbed extends Vue {
	@Prop(String)
	communityPath!: string;

	@Prop(ContentHydrator)
	hydrator!: ContentHydrator;

	community: Community | null = null;
	hasError = false;

	get isHydrated() {
		return !!this.community;
	}

	mounted() {
		this.loadCommunity();
	}

	async loadCommunity() {
		const hydratedData = await this.hydrator.getData('community-path', this.communityPath);
		if (hydratedData !== null) {
			this.community = new Community(hydratedData);
		} else {
			this.hasError = true;
		}
	}

	onClickRetry() {
		this.hasError = false;
		this.community = null;
		this.hydrator.dry('community-path', this.communityPath);
		this.loadCommunity();
	}
}
