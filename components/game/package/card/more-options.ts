import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./more-options.html';

import { GamePackageCardModel } from './card.model';
import { GameBuild } from '../../build/build.model';
import { filesize } from '../../../../vue/filters/filesize';
import { AppTrackEvent } from '../../../analytics/track-event.directive.vue';

@View
@Component({
	directives: {
		AppTrackEvent,
	},
	filters: {
		filesize,
	},
})
export class AppGamePackageCardMoreOptions extends Vue {
	@Prop(GamePackageCardModel) card: GamePackageCardModel;

	emulatorInfo = GameBuild.emulatorInfo;

	click(build: GameBuild) {
		this.$emit('click', build);
	}
}
