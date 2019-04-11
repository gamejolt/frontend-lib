import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import AppGameCompatIcons from '../../../../../../../app/components/game/compat-icons/compat-icons.vue';
import AppGameFollowWidget from '../../../../../../../app/components/game/follow-widget/follow-widget.vue';
import AppLoading from '../../../../../vue/components/loading/loading.vue';
import AppCard from '../../../../card/card.vue';
import { Game } from '../../../../game/game.model';
import AppGameThumbnailImg from '../../../../game/thumbnail-img/thumbnail-img.vue';
import { AppTheme } from '../../../../theme/theme';
import AppUserAvatar from '../../../../user/user-avatar/user-avatar.vue';
import { ContentHydrator } from '../../../content-hydrator';

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
