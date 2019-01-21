import View from '!view!./placement.html';
import { AppAdWidget } from 'game-jolt-frontend-lib/components/ad/widget/widget';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Screen } from '../../screen/screen-service';
import { Ads, AdSlotPos, AdSlotPosValidator } from '../ads.service';

@View
@Component({
	components: {
		AppAdWidget,
	},
})
export class AppAdPlacement extends Vue {
	@Prop({
		type: String,
		validator: AdSlotPosValidator,
	})
	pos?: AdSlotPos;

	@Prop(Boolean)
	hiddenXs?: boolean;

	@Prop(Boolean)
	hiddenSm?: boolean;

	@Prop(Boolean)
	hiddenDesktop?: boolean;

	@Prop(Boolean)
	visibleXs?: boolean;

	@Prop(Boolean)
	visibleSm?: boolean;

	@Prop(Boolean)
	visibleDesktop?: boolean;

	readonly Screen = Screen;

	get isVisible() {
		if (!Ads.shouldShow) {
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
