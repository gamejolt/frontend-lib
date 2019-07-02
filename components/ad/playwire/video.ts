import { Ads } from 'game-jolt-frontend-lib/components/ad/ads.service';
import { Playwire } from 'game-jolt-frontend-lib/components/ad/playwire/playwire.service';
import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import Vue, { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';
import Console from '../../../utils/console';
import PlaywireBoltEmbed from './playwire-bolt-embed';

@Component({})
export class AppAdPlaywireVideo extends Vue {
	private boltEmbed: PlaywireBoltEmbed | null = null;

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
		if (this.boltEmbed !== null) {
			this.boltEmbed.destroy();
			this.boltEmbed = null;
		}
	}

	display() {
		if (this.boltEmbed === null) {
			Console.debug('Initializing embed');
			this.boltEmbed = PlaywireBoltEmbed.create(this.$el);
			this.boltEmbed.render();
		}

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

	render(h: CreateElement) {
		return h('div');
	}
}
