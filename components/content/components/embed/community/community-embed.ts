import View from '!view!./community-embed.html?style=./community-embed.styl';
import { ContentHydrator } from 'game-jolt-frontend-lib/components/content/content-hydrator';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { AppLoading } from '../../../../../vue/components/loading/loading';
import { AppCard } from '../../../../card/card';
import { Community } from '../../../../community/community.model';
import { AppCommunityJoinWidget } from '../../../../community/join-widget/join-widget';
import { AppCommunityThumbnailImg } from '../../../../community/thumbnail/img/img';
import { AppTheme } from '../../../../theme/theme';

@View
@Component({
	components: {
		AppCard,
		AppLoading,
		AppTheme,
		AppCommunityThumbnailImg,
		AppCommunityJoinWidget,
	},
})
export class AppContentEmbedCommunityEmbed extends Vue {
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
