import View from '!view!./buttons.html';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { filesize } from '../../../../vue/filters/filesize';
import { AppTrackEvent } from '../../../analytics/track-event.directive';
import { AppPopper } from '../../../popper/popper';
import { Screen } from '../../../screen/screen-service';
import { GameBuild } from '../../build/build.model';
import { GamePackage } from '../package.model';
import { GamePackageCardModel } from './card.model';
import { AppGamePackageCardMoreOptions } from './more-options';

@View
@Component({
	components: {
		AppPopper,
		AppGamePackageCardMoreOptions,
	},
	directives: {
		AppTrackEvent,
	},
	filters: {
		filesize,
	},
})
export class AppGamePackageCardButtons extends Vue {
	@Prop(GamePackage) package!: GamePackage;
	@Prop(GamePackageCardModel) card!: GamePackageCardModel;

	readonly Screen = Screen;

	click(build: GameBuild, fromExtraSection = false) {
		this.$emit('click', { build, fromExtraSection });
	}
}
