import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./widget-game-list.html?style=./widget-game-list.styl';

import { Game } from '../../game/game.model';
import { AppGameThumbnailImg } from '../../game/thumbnail-img/thumbnail-img';
import { Environment } from '../../environment/environment.service';
import { WidgetCompiler } from '../widget-compiler.service';

@View
@Component({
	name: 'widget-compiler-widget-game-list',
	components: {
		AppGameThumbnailImg,
	},
})
export class AppWidgetCompilerWidgetGameList extends Vue
{
	@Prop( { type: Array, default: () => [] } ) games: Game[];

	get contentClass()
	{
		return WidgetCompiler.getContentClass();
	}

	url( game: Game )
	{
		return game.site ? game.site.url : Environment.baseUrl + game.getUrl();
	}
}
