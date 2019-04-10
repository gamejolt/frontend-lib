import AppCard from 'game-jolt-frontend-lib/components/card/card.vue';
import { ContentHydrator } from 'game-jolt-frontend-lib/components/content/content-hydrator';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import AppGameThumbnailImg from 'game-jolt-frontend-lib/components/game/thumbnail-img/thumbnail-img.vue';
import { AppTheme } from 'game-jolt-frontend-lib/components/theme/theme';
import AppUserAvatar from 'game-jolt-frontend-lib/components/user/user-avatar/user-avatar.vue';
import AppLoading from 'game-jolt-frontend-lib/vue/components/loading/loading.vue';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import AppGameCompatIcons from '../../../../../../../app/components/game/compat-icons/compat-icons.vue';
import AppGameFollowWidget from '../../../../../../../app/components/game/follow-widget/follow-widget.vue';

@Component({
	components: {
		AppGameCompatIcons,
		AppGameFollowWidget,
		AppCard,
		AppLoading,
		AppGameThumbnailImg,
		AppUserAvatar,
		AppTheme,
	},
})
export default class AppContentEmbedGameEmbed extends Vue {
	@Prop(String)
	gameId!: string;

	@Prop(ContentHydrator)
	hydrator!: ContentHydrator;

	game: Game | null = null;
	hasError = false;

	get isHydrated() {
		return !!this.game;
	}

	mounted() {
		this.loadGame();
	}

	async loadGame() {
		const hydratedData = await this.hydrator.getData('game-id', this.gameId);
		if (hydratedData !== null) {
			this.game = new Game(hydratedData);
		} else {
			this.hasError = true;
		}
	}

	onClickRetry() {
		this.hasError = false;
		this.game = null;
		this.hydrator.dry('game-id', this.gameId);
		this.loadGame();
	}
}
