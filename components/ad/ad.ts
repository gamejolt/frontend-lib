import Vue from 'vue';
import { State } from 'vuex-class';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./ad.html?style=./ad.styl';

import { Ads } from './ads.service';
import { Game } from '../game/game.model';
import { User } from '../user/user.model';
import { FiresidePost } from '../fireside/post/post-model';
import { AdSlot, AdSlotPos, AdSlotPosValidator, AdSlotTargetingMap } from './slot';
import { AppStore } from '../../vue/services/app/app-store';

@View
@Component({})
export class AppAd extends Vue {
	@Prop({ type: String, default: 'rectangle' })
	size: 'rectangle' | 'leaderboard';

	@Prop({
		type: String,
		validator: AdSlotPosValidator,
	})
	pos: AdSlotPos;

	@State app: AppStore;

	slot: AdSlot | null = null;
	refreshCount = 0;
	hasDisplayed = false;
	isDestroyed = false;
	debugInfo: any = null;

	get resourceInfo() {
		let resource: string = undefined as any;
		let resourceId: number = undefined as any;

		const adResource = Ads.resource;
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

	get shouldShow() {
		return Ads.shouldShow && this.slot && !this.isDestroyed;
	}

	get isDebugEnabled() {
		return 'AD_DEBUG' in this.$route.query;
	}

	mounted() {
		Ads.addAd(this);
	}

	beforeDestroy() {
		if (this.slot) {
			this.slot.isUsed = false;
			this.slot = null;
		}
		this.isDestroyed = true;

		Ads.removeAd(this);
	}

	refreshAdSlot() {
		if (this.slot) {
			this.slot.isUsed = false;
		}

		this.slot = Ads.getUnusedAdSlot(this.size) || null;
		if (this.slot) {
			this.slot.pos = this.pos;
			this.slot.isUsed = true;
		}
	}

	/**
	 * Used to display the initial ad in this slot. Separated into its own
	 * function so it can be async.
	 */
	async display() {
		// Let Vue compile it into the DOM.
		await this.$nextTick();

		if (!this.shouldShow || !this.slot) {
			return;
		}

		// We want to send the beacon as soon as possible so that we at least
		// log that we tried showing for this resoruce.
		this.sendBeacon(Ads.EVENT_VIEW);

		Ads.setSlotTargeting(this.slot, this.getTargeting());

		// Freeze the debug info so that we know what we have tried sending to
		// the ad server.
		this.generateDebugInfo();

		// If the slot has changed we need to display if for the first time,
		// otherwise just refresh it.
		if (!this.hasDisplayed) {
			this.hasDisplayed = true;
			Ads.display(this.slot);
		} else {
			++this.refreshCount;
			Ads.refresh(this.slot);
		}
	}

	onClick() {
		this.sendBeacon(Ads.EVENT_CLICK);
	}

	private sendBeacon(event: string) {
		Ads.sendBeacon(event, Ads.TYPE_DISPLAY, this.resourceInfo.resource, this.resourceInfo.resourceId);
	}

	private getTargeting(): AdSlotTargetingMap {
		if (!this.slot) {
			return {};
		}

		// Pull in any targeting for bids that may be set for this slot.
		const targeting = Object.assign({}, Ads.globalTargeting, Ads.bidTargeting[this.slot.id] || {});

		if (this.pos) {
			targeting.pos = this.pos;
		}

		targeting.signedin = this.app.user ? 'y' : 'n';

		return targeting;
	}

	private generateDebugInfo() {
		const resource = Ads.resource;

		this.debugInfo = {
			adUnit: this.slot && this.slot.adUnit,
			sizes: this.slot && this.slot.slotSizes,
			refreshCount: this.refreshCount,
			targeting: this.getTargeting(),
			resourceId: resource && resource.id,
		};
	}
}
