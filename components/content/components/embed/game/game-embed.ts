import View from '!view!./game-embed.html?style=./game-embed.styl';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { AppGameCompatIcons } from '../../../../../../../app/components/game/compat-icons/compat-icons';
import { AppGameFollowWidget } from '../../../../../../../app/components/game/follow-widget/follow-widget';
import { AppLoading } from '../../../../../vue/components/loading/loading';
import { AppCard } from '../../../../card/card';
import { Game } from '../../../../game/game.model';
import { AppGameThumbnailImg } from '../../../../game/thumbnail-img/thumbnail-img';
import { AppTheme } from '../../../../theme/theme';
import { AppUserAvatar } from '../../../../user/user-avatar/user-avatar';
import { ContentHydrator } from '../../../content-hydrator';

@View
@Component({
	components: {
		AppCard,
		AppLoading,
		AppGameThumbnailImg,
		AppUserAvatar,
		AppGameCompatIcons,
		AppGameFollowWidget,
		AppTheme,
	},
})
export class AppContentEmbedGameEmbed extends Vue {
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
