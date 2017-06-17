import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./card.html?style=./card.styl';

import { Game } from '../../game.model';
import { GamePackage } from '../package.model';
import { Sellable } from '../../../sellable/sellable.model';
import { GameRelease } from '../../release/release.model';
import { GameBuild } from '../../build/build.model';
import { GamePackageCardModel } from './card.model';
import { SellablePricing } from '../../../sellable/pricing/pricing.model';
import { Analytics } from '../../../analytics/analytics.service';
import { User } from '../../../user/user.model';
import { Growls } from '../../../growls/growls.service';
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

@View
@Component({
	components: {
		AppCard,
		AppJolticon,
		AppTimeAgo,
		AppFadeCollapse,
		AppExpand,
		AppCountdown,
		AppGamePackageCardButtons,
	},
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
	@Prop(String) partnerReferredKey?: string;
	@Prop(User) partnerReferredBy?: User;
	@Prop(Boolean) partnerNoCut?: boolean;

	showFullDescription = false;
	canToggleDescription = false;

	isOwned = false;
	isWhatOpen = false;
	isPaymentOpen = false;
	clickedBuild?: GameBuild;
	pricing: SellablePricing | null = null;
	sale = false;
	salePercentageOff = '';
	saleOldPricing: SellablePricing | null = null;
	hasPaymentWell = false;

	get card() {
		return new GamePackageCardModel(this.releases, this.builds);
	}

	created() {
		// // If this game is in their installed games, this will populate.
		// this.installedBuild = null;

		this.isOwned = this.sellable && this.sellable.is_owned ? true : false;

		// If there is a key on the package, then we should show it as being
		// "owned".
		if (this.accessKey) {
			this.isOwned = true;
		}

		if (this.sellable && this.sellable.pricings.length > 0) {
			this.pricing = this.sellable.pricings[0];
			if (this.pricing.promotional) {
				this.saleOldPricing = this.sellable.pricings[1];
				this.sale = true;
				this.salePercentageOff = ((this.saleOldPricing.amount -
					this.pricing.amount) /
					this.saleOldPricing.amount *
					100).toFixed(0);
			}
		}

		if (
			this.sellable &&
			!this.isOwned &&
			(this.sellable.type === 'pwyw' || this.sellable.type === 'paid')
		) {
			this.hasPaymentWell = true;
		}

		// // Event to be able to open up the payment form.
		// this.$scope.$on( 'Game_Package_Card.showPaymentOptions', ( _event, _package: GamePackage ) =>
		// {
		// 	// Ennsure that the payment well opens with the correct build
		// 	// for "skip paying".
		// 	if ( this.package.id === _package.id ) {
		// 		this.showPayment( this.card.downloadableBuild! );
		// 	}
		// } );
	}

	buildClick(build: GameBuild, fromExtraSection = false) {
		// For client, if they clicked in the "options" section, then skip
		// showing payment form. Just take them directly to site.
		if (GJ_IS_CLIENT && fromExtraSection) {
			this.doBuildClick(build, fromExtraSection);
		} else if (this.sellable.type === 'pwyw' && this.showPayment(build)) {
			// This will show the payment form if we're supposed to.
		} else {
			// Otherwise direct to the build.
			this.doBuildClick(build, fromExtraSection);
		}
	}

	private doBuildClick(build: GameBuild, fromExtraSection = false) {
		let operation = build.type === GameBuild.TYPE_DOWNLOADABLE
			? 'download'
			: 'play';
		if (build.type === GameBuild.TYPE_ROM && fromExtraSection) {
			operation = 'download';
		}

		if (operation === 'download') {
			this.download(build);
		} else if (operation === 'play') {
			this.showBrowserModal(build);
		}
	}

	showPayment(build: GameBuild) {
		// If this isn't a free game, then we want to slide the payment open. If
		// it's pay what you want, when the payment is open and they click a
		// build again, just take them to it.
		if (this.hasPaymentWell) {
			if (!this.isPaymentOpen) {
				this.isPaymentOpen = true;
				this.clickedBuild = build;
				return true;
			}
		}

		return false;
	}

	skipPayment() {
		// When they skip a pwyw payment form, on client we need to start the
		// install. On site we treat it like a normal build click.
		if (GJ_IS_CLIENT) {
			// this.startInstall( this.clickedBuild );
		} else {
			this.buildClick(this.clickedBuild!);
		}
	}

	private download(build: GameBuild) {
		Analytics.trackEvent('game-package-card', 'download', 'download');

		GameDownloader.download(this.$router, this.game, build, {
			isOwned: (this.sellable && this.isOwned) || this.isPartner,
			key: this.accessKey,
		});
	}

	private showBrowserModal(build: GameBuild) {
		Analytics.trackEvent('game-package-card', 'download', 'play');

		GamePlayModal.show(this.game, build, {
			// isOwned: (this.sellable && this.isOwned) || this.isPartner,
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

	onPackageBought() {
		this.isWhatOpen = false;
		this.isPaymentOpen = false;
		this.hasPaymentWell = false;
		this.isOwned = true;

		Growls.success({
			title: this.$gettext('Order Complete'),
			message: this.$gettextInterpolate(
				'Warm thanks from both %{ developer } and the Game Jolt team.',
				{ developer: this.game.developer.display_name },
			),
			sticky: true,
		});
	}
}

// @Component({
// 	selector: 'gj-game-package-card',
// 	template,
// })
// export class GamePackageCardComponent implements OnInit
// {

// 	// constructor(
// 	// 	@Inject( '$scope') private $scope: ng.IScope,
// 	// 	@Inject( 'gettextCatalog' ) private gettextCatalog: ng.gettext.gettextCatalog,
// 	// 	@Inject( 'Game_PlayModal' ) private Game_PlayModal: GamePlayModal,
// 	// 	@Inject( 'Game_Downloader' ) private Game_Downloader: any,
// 	// )
// 	// {
// 	// }

// }
