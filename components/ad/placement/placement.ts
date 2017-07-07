import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./placement.html';

import { Model } from '../../model/model.service';
import { Screen } from '../../screen/screen-service';
import { makeObservableService } from '../../../utils/vue';
import { isPrerender } from '../../environment/environment.service';
import { Game } from '../../game/game.model';
import { AppAd } from '../ad';

@View
@Component({
	components: {
		AppAd,
	},
})
export class AppAdPlacement extends Vue {
	@Prop([Object])
	resource?: Model;

	@Prop([Boolean])
	hiddenXs?: boolean;
	@Prop([Boolean])
	hiddenSm?: boolean;
	@Prop([Boolean])
	hiddenDesktop?: boolean;

	@Prop([Boolean])
	visibleXs?: boolean;
	@Prop([Boolean])
	visibleSm?: boolean;
	@Prop([Boolean])
	visibleDesktop?: boolean;

	Screen = makeObservableService(Screen);

	get isVisible() {
		if (
			Screen.isXs ||
			GJ_IS_CLIENT ||
			GJ_IS_SSR ||
			isPrerender ||
			(this.resource &&
				this.resource instanceof Game &&
				!this.resource._should_show_ads)
		) {
			return false;
		}

		let visibleXs = true;
		let visibleSm = true;
		let visibleDesktop = true;

		if (this.visibleXs || this.visibleSm || this.visibleDesktop) {
			visibleXs = !!this.visibleXs;
			visibleSm = !!this.visibleSm;
			visibleDesktop = !!this.visibleDesktop;
		} else {
			visibleXs = !this.hiddenXs;
			visibleSm = !this.hiddenSm;
			visibleDesktop = !this.hiddenDesktop;
		}

		return (
			(Screen.isXs && visibleXs) ||
			(Screen.isSm && visibleSm) ||
			(Screen.isDesktop && visibleDesktop)
		);
	}
}
