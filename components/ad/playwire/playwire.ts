import View from '!view!./playwire.html';
import { Ads } from 'game-jolt-frontend-lib/components/ad/ads.service';
import { Playwire } from 'game-jolt-frontend-lib/components/ad/playwire/playwire.service';
import { AdSlotPos, AdSlotPosValidator } from 'game-jolt-frontend-lib/components/ad/slot';
import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

function generateSlotId() {
	return Math.random() + '';
}

@View
@Component({})
export class AppAdPlaywire extends Vue {
	@Prop({ type: String, default: 'rectangle' })
	size!: 'rectangle' | 'leaderboard';

	@Prop({
		type: String,
		validator: AdSlotPosValidator,
	})
	pos!: AdSlotPos;

	/**
	 * We populate this when we first decide to show the ad, and then we change
	 * it as the route changes, which will tell Playwire to load a new ad in.
	 */
	slotId: string | null = null;

	/**
	 * This is a Playwire placement key ad must match their system.
	 */
	get placement() {
		const size = this.size === 'rectangle' ? 'med_rect' : 'leaderboard';
		const position = this.pos === 'top' ? 'atf' : 'btf';
		return `${size}_${position}`;
	}

	get resourceInfo() {
		let resource: string = undefined as any;
		let resourceId: number = undefined as any;

		const adResource = Ads.settings.resource;
		if (adResource instanceof Game) {
			resource = 'Game';
			resourceId = adResource.id;
		} else if (adResource instanceof User) {
			resource = 'User';
			resourceId = adResource.id;
		} else if (adResource instanceof FiresidePost) {
			resource = 'Fireside_Post';
			resourceId = adResource.id;
		}

		return { resource, resourceId };
	}

	mounted() {
		Playwire.init(this.$router);
		Playwire.addAd(this);
	}

	beforeDestroy() {
		Playwire.removeAd(this);
		// removeClickTracker(this.$el);
	}

	display() {
		console.log('display ad');
		this.slotId = generateSlotId();

		// Log that we viewed this ad immediately.
		this.sendBeacon(Ads.EVENT_VIEW);
		// addClickTracker(this.$el, () => this.sendBeacon(Ads.EVENT_CLICK));
	}

	// onClick() {
	// 	this.sendBeacon(Ads.EVENT_CLICK);
	// }

	private sendBeacon(event: string) {
		Ads.sendBeacon(
			event,
			Ads.TYPE_DISPLAY,
			this.resourceInfo.resource,
			this.resourceInfo.resourceId
		);
	}
}
