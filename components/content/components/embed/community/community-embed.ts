import AppCard from 'game-jolt-frontend-lib/components/card/card.vue';
import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import AppCommunityJoinWidget from 'game-jolt-frontend-lib/components/community/join-widget/join-widget.vue';
import AppCommunityThumbnailImg from 'game-jolt-frontend-lib/components/community/thumbnail/img/img.vue';
import { ContentHydrator } from 'game-jolt-frontend-lib/components/content/content-hydrator';
import { AppTheme } from 'game-jolt-frontend-lib/components/theme/theme';
import AppLoading from 'game-jolt-frontend-lib/vue/components/loading/loading.vue';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

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
