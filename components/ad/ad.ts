import Vue from 'vue';
import { State } from 'vuex-class';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./ad.html?style=./ad.styl';

import { Ads } from './ads.service';
import { Model } from '../model/model.service';
import { Game } from '../game/game.model';
import { User } from '../user/user.model';
import { FiresidePost } from '../fireside/post/post-model';
import { EventBus } from '../event-bus/event-bus.service';
import { Screen } from '../screen/screen-service';
import { AdSlot, AdSlotPos, AdSlotPosValidator } from './slot';
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
	pos?: AdSlotPos;

	@Prop(Object) resource?: Model;

	@State app: AppStore;

	slot: AdSlot | null = null;
	refreshCount = 0;
	debugInfo: any = null;

	private isDestroyed = false;
	private adsRefreshedEvent?: () => void = null as any;

	get resourceInfo() {
		let resource: string = undefined as any;
		let resourceId: number = undefined as any;

		if (this.resource instanceof Game) {
			resource = 'Game';
			resourceId = this.resource.id;
		} else if (this.resource instanceof User) {
			resource = 'User';
			resourceId = this.resource.id;
		} else if (this.resource instanceof FiresidePost) {
			resource = 'Fireside_Post';
			resourceId = this.resource.id;
		}

		return { resource, resourceId };
	}

	get isDebugEnabled() {
		return 'AD_DEBUG' in this.$route.query;
	}

	mounted() {
		if (
			Screen.isXs ||
			GJ_IS_CLIENT ||
			GJ_IS_SSR ||
			(this.resource && this.resource instanceof Game && !this.resource._should_show_ads)
		) {
			return;
		}

		if (Ads.routeResolved) {
			this.display();
		}

		// When the state changes we want to refresh this ad if the scope hasn't
		// been destroyed. This is for ads that are in a parent state outside
		// the changed view.
		EventBus.on(
			'$adsRefreshed',
			(this.adsRefreshedEvent = () => {
				// We need the destroyed event to trigger first. Setting a timeout
				// to 0 will cause it to run on next loop which will push this event
				// past any destroyed event that may happen.
				setTimeout(() => this.display(), 0);
			})
		);
	}

	destroyed() {
		if (this.slot) {
			this.slot.isUsed = false;
		}
		this.isDestroyed = true;

		EventBus.off('$adsRefreshed', this.adsRefreshedEvent);
		this.adsRefreshedEvent = undefined;
	}

	private getTargeting() {
		const targeting = Object.assign({}, Ads.getGlobalTargeting());

		if (this.pos) {
			targeting.pos = this.pos;
		}

		targeting.signedin = this.app.user ? 'y' : 'n';

		return targeting;
	}

	private refreshAdSlot() {
		if (this.slot) {
			this.slot.isUsed = false;
		}

		this.slot = Ads.getUnusedAdSlot(this.size) || null;
		if (this.slot) {
			this.slot.isUsed = true;
		}
	}

	/**
	 * Used to display the initial ad in this slot. Separated into its own
	 * function so it can be async.
	 */
	private async display() {
		const oldAdSlot = this.slot;
		this.refreshAdSlot();

		// Let Vue compile it into the DOM.
		await this.$nextTick();

		if (!this.slot || this.isDestroyed) {
			return;
		}

		// We want to send the beacon as soon as possible so that we at least
		// log that we tried showing for this resoruce.
		const resourceInfo = this.resourceInfo;
		Ads.sendBeacon(Ads.TYPE_DISPLAY, resourceInfo.resource, resourceInfo.resourceId);

		Ads.setSlotTargeting(this.slot, this.getTargeting());

		// Freeze the debug info so that we know what we have tried sending to
		// the ad server.
		this.generateDebugInfo();

		// If the slot has changed we need to display if for the first time,
		// otherwise just refresh it.
		if (oldAdSlot !== this.slot) {
			await Ads.display(this.slot.id);
		} else {
			++this.refreshCount;
			await Ads.refresh(this.slot.id);
		}
	}

	private generateDebugInfo() {
		this.debugInfo = {
			adUnit: this.slot && this.slot.adUnit,
			sizes: this.slot && this.slot.slotSizes,
			refreshCount: this.refreshCount,
			targeting: this.getTargeting(),
		};
	}
}
