import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./ad.html?style=./ad.styl';

import { AdSlot, Ads } from './ads.service';
import { Model } from '../model/model.service';
import { Game } from '../game/game.model';
import { User } from '../user/user.model';
import { FiresidePost } from '../fireside/post/post-model';
import { EventBus } from '../event-bus/event-bus.service';
import { Screen } from '../screen/screen-service';

@View
@Component({})
export class AppAd extends Vue {
	@Prop({ type: String, default: 'rectangle' })
	size: 'rectangle' | 'leaderboard';
	@Prop(Object) resource?: Model;

	slot: AdSlot | null = null;

	private isDestroyed = false;
	private adsRefreshedEvent?: () => void;

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

	mounted() {
		if (
			Screen.isXs ||
			GJ_IS_CLIENT ||
			GJ_IS_SSR ||
			(this.resource && this.resource instanceof Game && !this.resource._should_show_ads)
		) {
			return;
		}

		this.slot = Ads.getUnusedAdSlot(this.size) || null;
		if (this.slot) {
			this.slot.isUsed = true;

			const resourceInfo = this.resourceInfo;
			Ads.sendBeacon(Ads.TYPE_DISPLAY, resourceInfo.resource, resourceInfo.resourceId);
		}

		this.display();

		// When the state changes we want to refresh this ad if the scope hasn't
		// been destroyed. This is for ads that are in a parent state outside
		// the changed view.
		EventBus.on(
			'$adsRefreshed',
			(this.adsRefreshedEvent = () => {
				// We need the destroyed event to trigger first. Setting a timeout
				// to 0 will cause it to run on next loop which will push this event
				// past any destroyed event that may happen.
				setTimeout(() => this.refresh(), 0);
			})
		);
	}

	async display() {
		await this.$nextTick();
		if (this.slot) {
			await Ads.display(this.slot.id);
		}
	}

	/**
	 * Show a new ad in this slot.
	 */
	async refresh() {
		if (!this.slot || this.isDestroyed) {
			return;
		}

		Ads.refreshSlots([this.slot]);

		const resourceInfo = this.resourceInfo;
		Ads.sendBeacon(Ads.TYPE_DISPLAY, resourceInfo.resource, resourceInfo.resourceId);
	}

	destroyed() {
		if (this.slot) {
			this.slot.isUsed = false;
		}
		this.isDestroyed = true;

		EventBus.off('$adsRefreshed', this.adsRefreshedEvent);
		this.adsRefreshedEvent = undefined;
	}
}
