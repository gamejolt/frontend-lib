import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./buttons.html';

import { GamePackageCardModel } from './card.model';
import { GamePackage } from '../package.model';
import { GameBuild } from '../../build/build.model';
import { AppJolticon } from '../../../../vue/components/jolticon/jolticon';
import { AppPopover } from '../../../popover/popover';
import { AppTrackEvent } from '../../../analytics/track-event.directive.vue';
import { AppPopoverTrigger } from '../../../popover/popover-trigger.directive.vue';
import { filesize } from '../../../../vue/filters/filesize';
import { AppGamePackageCardMoreOptions } from './more-options';
import { makeObservableService } from '../../../../utils/vue';
import { Screen } from '../../../screen/screen-service';

@View
@Component({
	components: {
		AppJolticon,
		AppPopover,
		AppGamePackageCardMoreOptions,
	},
	directives: {
		AppTrackEvent,
		AppPopoverTrigger,
	},
	filters: {
		filesize,
	},
})
export class AppGamePackageCardButtons extends Vue {
	@Prop(GamePackage) package: GamePackage;
	@Prop(GamePackageCardModel) card: GamePackageCardModel;

	Screen = makeObservableService(Screen);

	click(build: GameBuild, fromExtraSection = false) {
		this.$emit('click', { build, fromExtraSection });
	}
}
