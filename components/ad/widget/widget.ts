import View from '!view!./widget.html?style=./widget.styl';
import { AppAd } from 'game-jolt-frontend-lib/components/ad/ad';
import { Ads, hasPlaywire } from 'game-jolt-frontend-lib/components/ad/ads.service';
import { AppAdPlaywire } from 'game-jolt-frontend-lib/components/ad/playwire/playwire';
import { AdSlotPos, AdSlotPosValidator } from 'game-jolt-frontend-lib/components/ad/slot';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import './widget-content.styl';

@View
@Component({})
export class AppAdWidget extends Vue {
	@Prop({ type: String, default: 'rectangle' })
	size!: 'rectangle' | 'leaderboard';

	@Prop({
		type: String,
		validator: AdSlotPosValidator,
	})
	pos!: AdSlotPos;

	get shouldShow() {
		return Ads.shouldShow;
	}

	get adComponent() {
		return hasPlaywire(this.$route) ? AppAdPlaywire : AppAd;
	}
}
