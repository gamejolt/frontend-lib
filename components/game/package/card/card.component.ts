import { Component, Input, Inject, OnInit } from 'ng-metadata/core';
import * as template from '!html-loader!./card.component.html';

import { Game } from '../../game.model';
import { GamePackage } from '../package.model';
import { Sellable } from '../../../sellable/sellable.model';
import { GameRelease } from '../../release/release.model';
import { GameBuild } from '../../build/build.model';
import { GamePlayModal } from '../../play-modal/play-modal.service';
import { Environment } from '../../../environment/environment.service';
import { GamePackageCardModel } from './card.model';
import { SellablePricing } from '../../../sellable/pricing/pricing.model';
import { Analytics } from '../../../analytics/analytics.service';
import { User } from '../../../user/user.model';
import { Growls } from '../../../growls/growls.service';

@Component({
	selector: 'gj-game-package-card',
	template,
})
export class GamePackageCardComponent implements OnInit
{
	@Input() game: Game;
	@Input() package: GamePackage;
	@Input() sellable: Sellable;
	@Input() releases: GameRelease[] = [];
	@Input() builds: GameBuild[] = [];
	@Input() key?: string;
	@Input() isPartner?: boolean;
	@Input() partnerReferredKey?: string;
	@Input() partnerReferredBy?: User;
	@Input() partnerNoCut?: boolean;

	showFullDescription = false;
	canToggleDescription = false;

	card: GamePackageCardModel;
	isOwned = false;
	isWhatOpen = false;
	isPaymentOpen = false;
	clickedBuild?: GameBuild;
	pricing?: SellablePricing;
	sale = false;
	salePercentageOff = '';
	saleOldPricing?: SellablePricing;
	hasPaymentWell = false;

	Environment = Environment;

	constructor(
		@Inject( '$scope') private $scope: ng.IScope,
		@Inject( 'gettextCatalog' ) private gettextCatalog: ng.gettext.gettextCatalog,
		@Inject( 'Game_PlayModal' ) private Game_PlayModal: GamePlayModal,
		@Inject( 'Game_Downloader' ) private Game_Downloader: any,
	)
	{
	}

	ngOnInit()
	{
		this.card = new GamePackageCardModel(
			this.releases,
			this.builds,
		);

		// // If this game is in their installed games, this will populate.
		// this.installedBuild = null;

		this.isOwned = this.sellable && this.sellable.is_owned ? true : false;

		// If there is a key on the package, then we should show it as being "owned".
		if ( this.key ) {
			this.isOwned = true;
		}

		if ( this.sellable && this.sellable.pricings.length > 0 ) {
			this.pricing = this.sellable.pricings[0];
			if ( this.pricing.promotional ) {
				this.saleOldPricing = this.sellable.pricings[1];
				this.sale = true;
				this.salePercentageOff = ((this.saleOldPricing.amount - this.pricing.amount) / this.saleOldPricing.amount * 100).toFixed( 0 );
			}
		}

		if ( this.sellable && !this.isOwned && (this.sellable.type === 'pwyw' || this.sellable.type === 'paid') ) {
			this.hasPaymentWell = true;
		}

		// Event to be able to open up the payment form.
		this.$scope.$on( 'Game_Package_Card.showPaymentOptions', ( _event, _package: GamePackage ) =>
		{
			// Ennsure that the payment well opens with the correct build
			// for "skip paying".
			if ( this.package.id === _package.id ) {
				this.showPayment( this.card.downloadableBuild! );
			}
		} );
	}

	buildClick( build: GameBuild, fromExtraSection = false )
	{
		// For client, if they clicked in the "options" section, then skip showing payment form.
		// Just take them directly to site.
		if ( Environment.isClient && fromExtraSection ) {
			this._doBuildClick( build, fromExtraSection );
		}
		// This will show the payment form if we're supposed to.
		else if ( this.sellable.type === 'pwyw' && this.showPayment( build ) ) {
		}
		// Otherwise direct to the build.
		else {
			this._doBuildClick( build, fromExtraSection );
		}
	}

	private _doBuildClick( build: GameBuild, fromExtraSection = false )
	{
		let operation = build.type === GameBuild.TYPE_DOWNLOADABLE ? 'download' : 'play';
		if ( build.type === GameBuild.TYPE_ROM && fromExtraSection ) {
			operation = 'download';
		}

		if ( operation === 'download' ) {
			this._download( build );
		}
		else if ( operation === 'play' ) {
			this._showBrowserModal( build );
		}
	}

	showPayment( build: GameBuild )
	{
		// If this isn't a free game, then we want to slide the payment open.
		// If it's pay what you want, when the payment is open and they click a build again, just take them to it.
		if ( this.hasPaymentWell ) {
			if ( !this.isPaymentOpen ) {
				this.isPaymentOpen = true;
				this.clickedBuild = build;
				return true;
			}
		}

		return false;
	}

	skipPayment()
	{
		// When they skip a pwyw payment form, on client we need to start the install.
		// On site we treat it like a normal build click.
		if ( Environment.isClient ) {
			this.startInstall( this.clickedBuild );
		}
		else {
			this.buildClick( this.clickedBuild! );
		}
	}

	private _download( build: GameBuild )
	{
		Analytics.trackEvent( 'game-package-card', 'download', 'download' );

		this.Game_Downloader.download( this.game, build, {
			isOwned: (this.sellable && this.isOwned) || this.isPartner,
			key: this.key,
		} );
	}

	private _showBrowserModal( build: GameBuild )
	{
		Analytics.trackEvent( 'game-package-card', 'download', 'play' );

		this.Game_PlayModal.show( this.game, build, {
			// isOwned: (this.sellable && this.isOwned) || this.isPartner,
			key: this.key,
		} );
	}

	integer( pricing: SellablePricing )
	{
		return Math.floor( pricing.amount / 100 );
	}

	decimal( pricing: SellablePricing )
	{
		let amount = pricing.amount;
		amount %= 100;

		let amountStr = amount + '';
		if ( amount < 10 ) {
			amountStr = amount + '0';
		}

		return amountStr;
	}

	onPackageBought()
	{
		this.isWhatOpen = false;
		this.isPaymentOpen = false;
		this.hasPaymentWell = false;
		this.isOwned = true;

		Growls.success( {
			title: this.gettextCatalog.getString( 'Order Complete' ),
			message: this.gettextCatalog.getString(
				'Warm thanks from both {{ developer }} and the Game Jolt team.',
				{ developer: this.game.developer.display_name }
			),
			sticky: true,
		} );
	}
}
