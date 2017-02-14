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
		@Inject( 'Growls' ) private Growls: any,
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

		this.Growls.success( {
			title: this.gettextCatalog.getString( 'Order Complete' ),
			message: this.gettextCatalog.getString( 'Warm thanks from both {{ developer }} and the Game Jolt team.', { developer: this.game.developer.display_name } ),
			sticky: true,
		} );
	}
}


// angular.module( 'gj.Game.Package.Card' ).directive( 'gjGamePackageCard', function(
// 	 )
// {
// 	// /**
// 	//  * Sort must start at 1 so that we can put their prefered OS as sort 0 later on.
// 	//  */
// 	// var supportInfo = {
// 	// 	windows: {
// 	// 		icon: 'windows',
// 	// 		tooltip: gettextCatalog.getString( 'Windows Support' ),
// 	// 		sort: 10,
// 	// 	},
// 	// 	windows_64: {
// 	// 		icon: 'windows',
// 	// 		tooltip: gettextCatalog.getString( 'Windows 64-bit Support' ),
// 	// 		arch: '64',
// 	// 		sort: 11,
// 	// 	},
// 	// 	mac: {
// 	// 		icon: 'mac',
// 	// 		tooltip: gettextCatalog.getString( 'Mac Support' ),
// 	// 		sort: 20,
// 	// 	},
// 	// 	mac_64: {
// 	// 		icon: 'mac',
// 	// 		tooltip: gettextCatalog.getString( 'Mac 64-bit Support' ),
// 	// 		arch: '64',
// 	// 		sort: 21,
// 	// 	},
// 	// 	linux: {
// 	// 		icon: 'linux',
// 	// 		tooltip: gettextCatalog.getString( 'Linux Support' ),
// 	// 		sort: 30,
// 	// 	},
// 	// 	linux_64: {
// 	// 		icon: 'linux',
// 	// 		tooltip: gettextCatalog.getString( 'Linux 64-bit Support' ),
// 	// 		arch: '64',
// 	// 		sort: 30,
// 	// 	},
// 	// 	other: {
// 	// 		icon: 'other-os',
// 	// 		tooltip: gettextCatalog.getString( 'Downloadable File' ),
// 	// 		sort: 40,
// 	// 	},
// 	// 	html: {
// 	// 		icon: 'html5',
// 	// 		tooltip: gettextCatalog.getString( 'Web Playable' ),
// 	// 		sort: 50,
// 	// 	},
// 	// 	flash: {
// 	// 		icon: 'flash',
// 	// 		tooltip: gettextCatalog.getString( 'Flash Web Playable' ),
// 	// 		sort: 51,
// 	// 	},
// 	// 	unity: {
// 	// 		icon: 'unity',
// 	// 		tooltip: gettextCatalog.getString( 'Unity Web Playable' ),
// 	// 		sort: 52,
// 	// 	},
// 	// 	applet: {
// 	// 		icon: 'java',
// 	// 		tooltip: gettextCatalog.getString( 'Java Applet Web Playable' ),
// 	// 		sort: 53,
// 	// 	},
// 	// 	silverlight: {
// 	// 		icon: 'silverlight',
// 	// 		tooltip: gettextCatalog.getString( 'Silverlight Web Playable' ),
// 	// 		sort: 54,
// 	// 	},
// 	// 	rom: {
// 	// 		icon: 'rom',
// 	// 		tooltip: gettextCatalog.getString( 'ROM' ),
// 	// 		sort: 60,
// 	// 	},
// 	// };

// 	// var emulatorInfo = {};
// 	// emulatorInfo[ Game_Build.EMULATOR_GB ] = gettextCatalog.getString( 'Game Boy' );
// 	// emulatorInfo[ Game_Build.EMULATOR_GBC ] = gettextCatalog.getString( 'Game Boy Color' );
// 	// emulatorInfo[ Game_Build.EMULATOR_GBA ] = gettextCatalog.getString( 'Game Boy Advance' );
// 	// emulatorInfo[ Game_Build.EMULATOR_NES ] = gettextCatalog.getString( 'NES' );
// 	// emulatorInfo[ Game_Build.EMULATOR_SNES ] = gettextCatalog.getString( 'SNES' );
// 	// emulatorInfo[ Game_Build.EMULATOR_VBOY ] = gettextCatalog.getString( 'Virtual Boy' );
// 	// emulatorInfo[ Game_Build.EMULATOR_GENESIS ] = gettextCatalog.getString( 'Genesis/Mega Drive' );
// 	// emulatorInfo[ Game_Build.EMULATOR_ATARI2600 ] = gettextCatalog.getString( 'Atari 2600' );
// 	// emulatorInfo[ Game_Build.EMULATOR_ZX ] = gettextCatalog.getString( 'ZX Spectrum' );
// 	// emulatorInfo[ Game_Build.EMULATOR_C64 ] = gettextCatalog.getString( 'Commodore 64' );
// 	// emulatorInfo[ Game_Build.EMULATOR_CPC ] = gettextCatalog.getString( 'Amstrad CPC' );
// 	// emulatorInfo[ Game_Build.EMULATOR_MSX ] = gettextCatalog.getString( 'MSX' );

// 	// function pluckOsSupport( build )
// 	// {
// 	// 	var support = [];

// 	// 	// We only include the 64-bit versions if the build doesn't have 32bit and 64bit
// 	// 	// on the same build. That basically just means it's a universal build.

// 	// 	if ( build.os_windows ) {
// 	// 		support.push( 'windows' );
// 	// 	}

// 	// 	if ( build.os_windows_64 && !build.os_windows ) {
// 	// 		support.push( 'windows_64' );
// 	// 	}

// 	// 	if ( build.os_mac ) {
// 	// 		support.push( 'mac' );
// 	// 	}

// 	// 	if ( build.os_mac_64 && !build.os_mac ) {
// 	// 		support.push( 'mac_64' );
// 	// 	}

// 	// 	if ( build.os_linux ) {
// 	// 		support.push( 'linux' );
// 	// 	}

// 	// 	if ( build.os_linux_64 && !build.os_linux ) {
// 	// 		support.push( 'linux_64' );
// 	// 	}

// 	// 	if ( build.os_other ) {
// 	// 		support.push( 'other' );
// 	// 	}

// 	// 	return support;
// 	// }

// 	// function checkSupport( support, type )
// 	// {
// 	// 	return support.indexOf( type ) !== -1;
// 	// }

// 	return {
// 		restrict: 'E',
// 		template: require( '!html-loader!./card.html' ),
// 		scope: {},
// 		bindToController: {

// 		},
// 		controllerAs: 'ctrl',
// 		controller: function( $scope, $attrs, $parse )
// 		{
// 			var _this = this;


// 			// if ( this.builds ) {

// 			// 	var os = Device.os();
// 			// 	var arch = Device.arch();

// 			// 	// Indexes by the os/type of the build: [ { type: build } ]
// 			// 	// While looping we also gather all OS/browser support for this complete package.
// 			// 	var indexedBuilds = {};
// 			// 	var otherBuilds = [];
// 			// 	this.builds.forEach( function( build )
// 			// 	{
// 			// 		if ( build.isBrowserBased() ) {
// 			// 			indexedBuilds[ build.type ] = build;
// 			// 			this.support.push( build.type );
// 			// 		}
// 			// 		else if ( build.type == Game_Build.TYPE_ROM ) {
// 			// 			indexedBuilds[ build.type ] = build;
// 			// 			this.support.push( build.type );
// 			// 			otherBuilds.push( build );
// 			// 		}
// 			// 		else if ( build.os_other ) {
// 			// 			otherBuilds.push( build );
// 			// 		}
// 			// 		else {
// 			// 			var support = pluckOsSupport( build );
// 			// 			support.forEach( function( _os )
// 			// 			{
// 			// 				indexedBuilds[ _os ] = build;
// 			// 				this.support.push( this.supportInfo[ _os ].icon );
// 			// 			}, this );
// 			// 		}
// 			// 	}, this );

// 			// 	this.support = _.uniq( this.support );

// 			// 	// At this point we should have all the OS/browser support, so let's sort it.
// 			// 	// The sort values are defined above, but we want to push their detected OS at
// 			// 	// the front. This is because you'd probably want to see [linux] first if you're
// 			// 	// on a linux machine, before windows, etc.
// 			// 	// We change the sort for their detected OS to be the first before sorting.
// 			// 	this.supportInfo[ os ].sort = 0;
// 			// 	this.support.sort( function( a, b )
// 			// 	{
// 			// 		return _this.supportInfo[ a ].sort - _this.supportInfo[ b ].sort;
// 			// 	} );

// 			// 	// Now that we have all the builds indexed by the platform they support
// 			// 	// we need to try to pick one to showcase as the default download. We put
// 			// 	// their detected OS first so that it tries to pick that one first.
// 			// 	var checkDownloadables = [ 'windows', 'windows_64', 'mac', 'mac_64', 'linux', 'linux_64' ];

// 			// 	// This will put the 64 bit version as higher priority.
// 			// 	if ( arch == '64' ) {
// 			// 		checkDownloadables.unshift( os );
// 			// 		checkDownloadables.unshift( os + '_64' );
// 			// 	}
// 			// 	// If we don't have a detected arch that is 64, we prioritize the universal version.
// 			// 	else {
// 			// 		checkDownloadables.unshift( os + '_64' );
// 			// 		checkDownloadables.unshift( os );
// 			// 	}

// 			// 	checkDownloadables.every( function( _os )
// 			// 	{
// 			// 		if ( !indexedBuilds[ _os ] ) {
// 			// 			return true;
// 			// 		}
// 			// 		this.downloadableBuild = indexedBuilds[ _os ];
// 			// 		this.showcasedOs = _os;
// 			// 		this.showcasedOsIcon = _this.supportInfo[ _os ].icon;
// 			// 	}, this );

// 			// 	// Do the same with browser type. Pick the default browser one to show.
// 			// 	// We include ROMs in browser play.
// 			// 	[ 'html', 'flash', 'unity', 'applet', 'silverlight', 'rom' ].every( function( type )
// 			// 	{
// 			// 		if ( !indexedBuilds[ type ] ) {
// 			// 			return true;
// 			// 		}
// 			// 		this.browserBuild = indexedBuilds[ type ];
// 			// 		this.showcasedBrowserIcon = _this.supportInfo[ type ].icon;
// 			// 	}, this );

// 			// 	// Pull the showcased release version.
// 			// 	// It should be the greater one for either the downloadable or browser build chosen.
// 			// 	if ( this.downloadableBuild ) {
// 			// 		this.showcasedRelease = this.downloadableBuild._release;
// 			// 	}

// 			// 	// Lower sort value is a "newer" version.
// 			// 	if ( this.browserBuild && (!this.showcasedRelease || this.browserBuild._release.sort < this.showcasedRelease) ) {
// 			// 		this.showcasedRelease = this.browserBuild._release;
// 			// 	}

// 			// 	function addExtraBuild( build, type )
// 			// 	{
// 			// 		// Whether or not we stored this build in extra builds yet.
// 			// 		var alreadyAdded = false;
// 			// 		_this.extraBuilds.forEach( function( extraBuild )
// 			// 		{
// 			// 			if ( extraBuild.build.id == build.id ) {
// 			// 				alreadyAdded = true;
// 			// 			}
// 			// 		} );

// 			// 		if ( alreadyAdded ) {
// 			// 			return;
// 			// 		}

// 			// 		_this.extraBuilds.push( {
// 			// 			type: build.type,
// 			// 			icon: _this.supportInfo[ type ].icon,
// 			// 			build: build,
// 			// 			arch: _this.supportInfo[ type ].arch || null,
// 			// 			platform: type,
// 			// 		} );
// 			// 	}

// 			// 	// Now pull the extra builds (ones that aren't default).
// 			// 	angular.forEach( indexedBuilds, function( build, type )
// 			// 	{
// 			// 		if ( build == _this.downloadableBuild && type == _this.showcasedOs ) {
// 			// 			return;
// 			// 		}

// 			// 		if ( build.type != Game_Build.TYPE_DOWNLOADABLE ) {
// 			// 			if ( _this.browserBuild && _this.browserBuild.id == build.id ) {
// 			// 				return;
// 			// 			}
// 			// 		}

// 			// 		addExtraBuild( build, type );
// 			// 	} );

// 			// 	// Add all the "Other" builds onto the end of extra.
// 			// 	if ( otherBuilds.length ) {
// 			// 		otherBuilds.forEach( function( build )
// 			// 		{
// 			// 			var supportKey = 'other';
// 			// 			if ( build.type == Game_Build.TYPE_ROM ) {
// 			// 				supportKey = 'rom';
// 			// 			}

// 			// 			addExtraBuild( build, supportKey );
// 			// 		} );
// 			// 	}

// 			// 	// Sort extra builds if there are any.
// 			// 	if ( this.extraBuilds.length ) {
// 			// 		this.extraBuilds.sort( function( a, b )
// 			// 		{
// 			// 			return _this.supportInfo[ a.platform ].sort - _this.supportInfo[ b.platform ].sort;
// 			// 		} );
// 			// 	}

// 			// 	if ( !this.downloadableBuild && !this.browserBuild && otherBuilds.length ) {
// 			// 		this.otherOnly = true;
// 			// 		this.showcasedRelease = this.releases[0];
// 			// 	}
// 			// }


// 		}
// 	};
// } );
