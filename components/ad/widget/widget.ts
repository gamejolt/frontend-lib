import View from '!view!./widget.html?style=./widget.styl';
import { AppAd } from 'game-jolt-frontend-lib/components/ad/ad';
import { Ads } from 'game-jolt-frontend-lib/components/ad/ads.service';
import { AppAdPlaywire } from 'game-jolt-frontend-lib/components/ad/playwire/playwire';
import { AdSlotPos, AdSlotPosValidator } from 'game-jolt-frontend-lib/components/ad/slot';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Route } from 'vue-router';
import './widget-content.styl';

// Only check once and then freeze so they can navigate site with it sticky.
let _hasPlaywire: boolean | undefined;
function hasPlaywire(route: Route) {
	if (_hasPlaywire === undefined) {
		_hasPlaywire = 'PLAYWIRE_TEST' in route.query;
	}
	return _hasPlaywire;
}

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
