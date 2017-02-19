import * as Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./thumbnail-img.html';

import { AppImgResponsive } from '../../img/responsive/responsive.directive.vue';
import { Game } from '../game.model';

@View
@Component({
	name: 'game-thumbnail-img',
	directives: {
		AppImgResponsive,
	},
})
export class AppGameThumbnailImg extends Vue
{
	@Prop( Object ) game: Game;
}
