import { Injectable, Inject } from 'ng-metadata/core';
import { HistoryTick } from '../../history-tick/history-tick-service';
import { Popover } from '../../popover/popover.service';
import { Environment } from '../../environment/environment.service';
import { Device } from '../../device/device.service';
import { hasProvider, getProvider } from '../../../utils/utils';
import { GameBuild } from '../build/build.model';

@Injectable( 'Game_PlayModal' )
export class GamePlayModal
{
	hasModal = false;

	constructor(
		@Inject( '$rootScope' ) private $rootScope: ng.IRootScopeService,
		@Inject( '$document' ) private $document: ng.IDocumentService,
		@Inject( '$compile' ) private $compile: ng.ICompileService,
		@Inject( '$animate' ) private $animate: ng.animate.IAnimateService,
		@Inject( 'Growls' ) private growls: any,
		@Inject( 'HistoryTick' ) private historyTick: HistoryTick,
		@Inject( 'Popover' ) private popover: Popover,
		@Inject( 'Analytics' ) private analytics: any,
	)
	{
	}

	show( _game: any, _build: any, options: { key?: string } = {} )
	{
		this.analytics.trackEvent( 'game-play', 'play' );

		if ( this.hasModal ) {
			this.growls.error( 'You already have a browser game open. You can only have one running at a time.', 'Oh no!' );
			return Promise.reject( undefined );
		}

		this.historyTick.sendBeacon( 'game-build', _build.id, {
			sourceResource: 'Game',
			sourceResourceId: _game.id,
			key: options.key,
		} );

		const gameserverUrl = `${Environment.secureBaseUrl}/x/builds/get-download-url/${_build.id}?key=${options.key}`;

		// Will open the gameserver in their browser.
		if ( GJ_IS_CLIENT && _build.type != GameBuild.TYPE_HTML && _build.type != GameBuild.TYPE_ROM ) {
			const gui = require( 'nw.gui' );
			gui.Shell.openExternal( gameserverUrl );

			// If they clicked into this through a popover.
			this.popover.hideAll();

			return Promise.resolve( undefined );
		}

		// Safari doesn't allow you to set cookies on a domain that isn't the
		// same as the current domain. That means our cookie signing breaks in
		// the iframe. To fix we have to open a new tab to the gameserver.
		if ( Device.browser().indexOf( 'Safari' ) !== -1 ) {
			window.open( gameserverUrl );

			// If they clicked into this through a popover.
			this.popover.hideAll();

			return Promise.resolve( undefined );
		}

		this.hasModal = true;

		const modalScope = this.$rootScope.$new( true );
		modalScope['game'] = _game;
		modalScope['build'] = _build;
		modalScope['options'] = options;
		modalScope['canMinimize'] = hasProvider( 'Minbar' );
		modalScope['minimize'] = minimize;
		modalScope['maximize'] = maximize;
		modalScope['close'] = close;

		const body: HTMLElement = this.$document.find( 'body' ).eq( 0 )[0];
		const modalElemTemplate = angular.element( `
			<gj-game-play-modal
				game="game"
				build="build"
				key="options.key"
				can-minimize="canMinimize"
				minimize="minimize()"
				maximize="maximize()"
				close="close()"
				>
			</gj-game-play-modal>`
		);
		const modalElem = this.$compile( modalElemTemplate )( modalScope );

		this.$animate.enter( modalElem, angular.element( body ) );
		body.classList.add( 'game-play-modal-open' );

		// Pull into this scope.
		const $animate = this.$animate;

		function minimize()
		{
			// We basically animate it out but keep it in the DOM.
			// This is so we don't lose the game when closing it.
			body.classList.remove( 'game-play-modal-open' );
			modalElem[0].style.display = 'none';

			// When this minbar item is clicked, it basically shows this modal again.
			const Minbar = getProvider<any>( 'Minbar' );
			const minbarItem = Minbar.add( {
				title: this.game.title,
				thumb: this.game.img_thumbnail,
				isActive: true,  // Only one game open at a time, so make it active.
				onClick: function()
				{
					// We remove the item from the minbar.
					Minbar.remove( minbarItem );

					// Then we show the modal again.
					maximize();
				}
			} );
		}

		function maximize()
		{
			// Add everything back in!
			body.classList.add( 'game-play-modal-open' );
			modalElem[0].style.display = 'block';
		}

		const self = this;
		function close()
		{
			$animate.leave( modalElem ).then( function()
			{
				modalScope.$destroy();
				body.classList.remove( 'game-play-modal-open' );

				self.hasModal = false;
			} );

			// Show a rating growl when they close the game play modal.
			// This will urge them to rate the game after playing it, but only if they haven't
			// rated it yet.
			if ( hasProvider( 'Game_RatingGrowl' ) ) {
				getProvider<any>( 'Game_RatingGrowl' ).show( _game );
			}
		}
	};
}
