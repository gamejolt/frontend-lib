import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./buttons.html';

import { GamePackageCardModel } from './card.model';
import { GamePackage } from '../package.model';
import { GameBuild } from '../../build/build.model';
import { AppTrackEvent } from '../../../analytics/track-event.directive.vue';
import { filesize } from '../../../../vue/filters/filesize';
import { AppGamePackageCardMoreOptions } from './more-options';
import { Screen } from '../../../screen/screen-service';
import { AppPopper } from '../../../popper/popper';

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
