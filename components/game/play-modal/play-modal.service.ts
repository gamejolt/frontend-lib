import * as angular from 'angular';
import { Injectable, Inject } from 'ng-metadata/core';
import { HistoryTick } from '../../history-tick/history-tick-service';
import { Popover } from '../../popover/popover.service';
import { Device } from '../../device/device.service';
import { hasProvider, getProvider } from '../../../utils/utils';
import { Game } from '../game.model';
import { GameBuild } from '../build/build.model';
import { Analytics } from '../../analytics/analytics.service';

@Injectable( 'Game_PlayModal' )
export class GamePlayModal
{
	hasModal = false;

	constructor(
		@Inject( '$rootScope' ) private $rootScope: ng.IRootScopeService,
		@Inject( '$compile' ) private $compile: ng.ICompileService,
		@Inject( '$animate' ) private $animate: ng.animate.IAnimateService,
		@Inject( 'Growls' ) private growls: any,
		@Inject( 'HistoryTick' ) private historyTick: HistoryTick,
		@Inject( 'Popover' ) private popover: Popover,
	)
	{
	}

	async show( _game: Game, _build: GameBuild, options: { key?: string } = {} )
	{
		Analytics.trackEvent( 'game-play', 'play' );

		if ( this.hasModal ) {
			this.growls.error( 'You already have a browser game open. You can only have one running at a time.', 'Oh no!' );
			return Promise.reject( undefined );
		}

		this.historyTick.sendBeacon( 'game-build', _build.id, {
			sourceResource: 'Game',
			sourceResourceId: _game.id,
			key: options.key,
		} );

		// const gameserverUrl = `${Environment.secureBaseUrl}/x/builds/get-download-url/${_build.id}?key=${options.key || ''}`;

		// If they clicked into this through a popover.
		this.popover.hideAll();

		// Will open the gameserver in their browser.
		if ( GJ_IS_CLIENT && _build.type !== GameBuild.TYPE_HTML && _build.type !== GameBuild.TYPE_ROM ) {
			const gui = require( 'nw.gui' );
			const payload = await _build.getDownloadUrl( { key: options.key } );
			gui.Shell.openExternal( payload.downloadUrl );
			return;
		}

		// Safari doesn't allow you to set cookies on a domain that isn't the
		// same as the current domain. That means our cookie signing breaks in
		// the iframe. To fix we have to open a new tab to the gameserver.
		if ( Device.browser().indexOf( 'Safari' ) !== -1 ) {

			// We have to open the window first before getting the URL. The
			// browser will block the popup unless it's done directly in the
			// onclick handler. Once we have the download URL we can direct the
			// window that we now have the reference to.
			const win = window.open( '' );
			const payload = await _build.getDownloadUrl( { key: options.key } );
			win.location.href = payload.downloadUrl;
			return;
		}

		this.hasModal = true;
		const payload = await _build.getDownloadUrl( { key: options.key } );

		const modalScope = this.$rootScope.$new( true );
		modalScope['url'] = payload.downloadUrl;
		modalScope['canMinimize'] = hasProvider( 'Minbar' );
		modalScope['minimize'] = minimize;
		modalScope['close'] = close;

		const body: HTMLElement = document.body;
		const modalElemTemplate = angular.element( `
			<gj-game-play-modal
				[url]="url"
				[can-minimize]="canMinimize"
				(minimize)="minimize()"
				(close)="close()"
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
				title: _game.title,
				thumb: _game.img_thumbnail,
				isActive: true,  // Only one game open at a time, so make it active.
				onClick: () =>
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
			$animate.leave( modalElem ).then( () =>
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
