import { Ads } from 'game-jolt-frontend-lib/components/ad/ads.service';
import { Playwire } from 'game-jolt-frontend-lib/components/ad/playwire/playwire.service';
import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

@Component({})
export default class AppAdPlaywireVideo extends Vue {
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
		Playwire.addAd(this);
	}

	beforeDestroy() {
		Playwire.removeAd(this);
	}

	display() {
		this.renderScript();

		// Log that we viewed this ad immediately.
		this.sendBeacon(Ads.EVENT_VIEW);
	}

	private sendBeacon(event: string) {
		Ads.sendBeacon(
			event,
			Ads.TYPE_DISPLAY,
			this.resourceInfo.resource,
			this.resourceInfo.resourceId
		);
	}

	private renderScript() {
		const script = window.document.createElement('script');
		script.dataset.config = 'https://config.playwire.com/1391/playlists/v2/4898/zeus.json';

		this.$el.appendChild(script);
		script.src = 'https://cdn.playwire.com/bolt/js/zeus/embed.js';
	}
}