import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./card.html?style=./card.styl';

import { Game } from '../../game.model';
import { GamePackage } from '../package.model';
import { Sellable } from '../../../sellable/sellable.model';
import { GameRelease } from '../../release/release.model';
import { GameBuild } from '../../build/build.model';
import { GamePackageCardModel } from './card.model';
import { SellablePricing } from '../../../sellable/pricing/pricing.model';
import { Analytics } from '../../../analytics/analytics.service';
import { User } from '../../../user/user.model';
import { AppCard } from '../../../card/card';
import { currency } from '../../../../vue/filters/currency';
import { AppJolticon } from '../../../../vue/components/jolticon/jolticon';
import { AppTooltip } from '../../../tooltip/tooltip';
import { AppTimeAgo } from '../../../time/ago/ago';
import { AppFadeCollapse } from '../../../fade-collapse/fade-collapse';
import { AppTrackEvent } from '../../../analytics/track-event.directive.vue';
import { AppExpand } from '../../../expand/expand';
import { filesize } from '../../../../vue/filters/filesize';
import { AppCountdown } from '../../../countdown/countdown';
import { GameDownloader } from '../../downloader/downloader.service';
import { AppGamePackageCardButtons } from './buttons';
import { GamePlayModal } from '../../play-modal/play-modal.service';
import { GamePackagePurchaseModal } from '../purchase-modal/purchase-modal.service';
import { LocalDbPackage } from '../../../../../../app/components/client/local-db/package/package.model';
import { AppClientPackageCardButtons } from '../../../../../../app/components/client/package-card-buttons/package-card-buttons';
import { EventBus } from '../../../event-bus/event-bus.service';
import { LinkedKey } from '../../../linked-key/linked-key.model';
import { Clipboard } from '../../../clipboard/clipboard-service';

let components: { [name: string]: new () => Vue } = {
	AppCard,
	AppJolticon,
	AppTimeAgo,
	AppFadeCollapse,
	AppExpand,
	AppCountdown,
	AppGamePackageCardButtons,
};

if (GJ_IS_CLIENT) {
	components = {...components, AppClientPackageCardButtons};
}

@View
@Component({
	components,
	directives: {
		AppTooltip,
		AppTrackEvent,
	},
	filters: {
		currency,
		filesize,
	},
})
export class AppGamePackageCard extends Vue {
	@Prop(Game) game: Game;
	@Prop(GamePackage) package: GamePackage;
	@Prop(Sellable) sellable: Sellable;
	@Prop({ type: Array, default: () => [] })
	releases: GameRelease[];
	@Prop({ type: Array, default: () => [] })
	builds: GameBuild[];
	@Prop(String) accessKey?: string;
	@Prop(Boolean) isPartner?: boolean;
	@Prop(String) partnerKey?: string;
	@Prop(User) partner?: User;

	showFullDescription = false;
	canToggleDescription = false;

	isWhatOpen = false;
	pricing: SellablePricing | null = null;
	sale = false;
	salePercentageOff = '';
	saleOldPricing: SellablePricing | null = null;
	localPackage: LocalDbPackage | null = null;

	providerIcons: { [provider: string]: string } = {
		steam: 'steam',
	};

	get card() {
		return new GamePackageCardModel(this.releases, this.builds, this.linkedKeys);
	}

	get isOwned() {
		// If there is a key on the package, then we should show it as being
		// "owned".
		if (this.accessKey) {
			return true;
		}

		return this.sellable && this.sellable.is_owned ? true : false;
	}

	get linkedKeys() {
		if (!this.sellable) {
			return [];
		}

		return this.sellable.linked_keys || [];
	}

	get canBuy() {
		return (
			this.sellable &&
			!this.isOwned &&
			(this.sellable.type === 'pwyw' || this.sellable.type === 'paid')
		);
	}

	created() {
		// TODO(rewrite,cros)
		// // If this game is in their installed games, this will populate.
		// this.installedBuild = null;

		if (this.sellable && this.sellable.pricings.length > 0) {
			this.pricing = this.sellable.pricings[0];
			if (this.pricing.promotional) {
				this.saleOldPricing = this.sellable.pricings[1];
				this.sale = true;
				this.salePercentageOff = ((this.saleOldPricing.amount - this.pricing.amount) /
					this.saleOldPricing.amount *
					100).toFixed(0);
			}
		}

		// Event to be able to open up the payment form.
		EventBus.on('GamePackageCard.showPaymentOptions', (package_: GamePackage) => {
			// Ensure that the payment well opens with the correct build
			// for "skip paying".
			if (this.package.id === package_.id) {
				this.showPayment(this.card.downloadableBuild ? this.card.downloadableBuild : undefined);
			}
		});
	}

	buildClick(build: GameBuild, fromExtraSection = false) {
		// For client, if they clicked in the "options" section, then skip
		// showing payment form. Just take them directly to site.
		if (GJ_IS_CLIENT && fromExtraSection) {
			this.doBuildClick(build, fromExtraSection);
		} else if (this.sellable.type === 'pwyw' && this.canBuy) {
			this.showPayment(build);
		} else {
			this.doBuildClick(build, fromExtraSection);
		}
	}

	private doBuildClick(build: GameBuild, fromExtraSection = false) {
		let operation = build.type === GameBuild.TYPE_DOWNLOADABLE ? 'download' : 'play';
		if (build.type === GameBuild.TYPE_ROM && fromExtraSection) {
			operation = 'download';
		}

		console.log(`${operation}ing build`);

		if (operation === 'download') {
			this.download(build);
		} else if (operation === 'play') {
			this.showBrowserModal(build);
		}
	}

	showPayment(build?: GameBuild) {
		GamePackagePurchaseModal.show({
			game: this.game,
			package: this.package,
			build,
			partner: this.partner,
			partnerKey: this.partnerKey,
		});
	}

	private download(build: GameBuild) {
		Analytics.trackEvent('game-package-card', 'download', 'download');

		GameDownloader.download(this.$router, this.game, build, {
			isOwned: this.isOwned || this.isPartner,
			key: this.accessKey,
		});
	}

	private showBrowserModal(build: GameBuild) {
		Analytics.trackEvent('game-package-card', 'download', 'play');

		GamePlayModal.show(this.game, build, {
			// isOwned: this.isOwned || this.isPartner,
			key: this.accessKey,
		});
	}

	integer(pricing: SellablePricing) {
		return pricing.amount;
	}

	decimal(pricing: SellablePricing) {
		let amount = pricing.amount;
		amount %= 100;

		let amountStr = amount + '';
		if (amount < 10) {
			amountStr = amount + '0';
		}

		return amountStr;
	}

	copyProviderKey(key: LinkedKey) {
		Clipboard.copy(key.key);
	}
}
