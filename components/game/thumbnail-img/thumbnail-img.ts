import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./thumbnail-img.html';

import { AppImgResponsive } from '../../img/responsive/responsive';
import { Game } from '../game.model';

@View
@Component({
	components: {
		AppImgResponsive,
	},
})
export class AppGameThumbnailImg extends Vue {
	@Prop([Object])
	game: Game;

	imgLoadChange(isLoaded: boolean) {
		if (isLoaded) {
			this.$emit('loaded');
		}
	}
}
