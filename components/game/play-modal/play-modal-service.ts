import { Injectable, Inject } from 'ng-metadata/core';
import { HistoryTick } from './../../history-tick/history-tick-service';

@Injectable()
export class Game_PlayModal
{
	hasModal = false;

	constructor(
		@Inject( '$rootScope' ) private $rootScope: angular.IRootScopeService,
		@Inject( '$document' ) private $document: angular.IDocumentService,
		@Inject( '$q' ) private $q: angular.IQService,
		@Inject( '$state' ) private $state: angular.ui.IStateService,
		@Inject( '$compile' ) private $compile: angular.ICompileService,
		@Inject( '$animate' ) private $animate: angular.animate.IAnimateService,
		@Inject( '$injector' ) private $injector: any,
		@Inject( 'Growls' ) private Growls: any,
		@Inject( 'HistoryTick' ) private HistoryTick: HistoryTick,
		@Inject( 'Environment' ) private Environment: any,
		@Inject( 'Popover' ) private Popover: any,
		@Inject( 'Analytics' ) private Analytics: any,
		@Inject( 'Game_Build' ) private Game_Build: any
	)
	{
	}

	show( _game: any, _build: any )
	{
		this.Analytics.trackEvent( 'game-play', 'play' );

		// TODO: This only goes to game page. We need to direct to a URL that would open the correct build in a modal.
		if ( this.Environment.isClient && _build.type != this.Game_Build.TYPE_HTML && _build.type != this.Game_Build.TYPE_ROM ) {
			const gui = require( 'nw.gui' );
			gui.Shell.openExternal( this.Environment.baseUrl + this.$state.href( 'discover.games.view.overview', {
				slug: _game.slug,
				id: _game.id,
			} ) );

			// If they clicked into this through a popover.
			this.Popover.hideAll();

			return this.$q.resolve();
		}

		if ( this.hasModal ) {
			this.Growls.error( 'You already have a browser game open. You can only have one running at a time.', 'Oh no!' );
			return this.$q.reject();
		}

		this.hasModal = true;
		this.HistoryTick.sendBeacon( 'game-build', _build.id, { sourceResource: 'Game', sourceResourceId: _game.id } );

		const modalScope = this.$rootScope.$new( true );
		modalScope['game'] = _game;
		modalScope['build'] = _build;
		modalScope['canMinimize'] = this.$injector.has( 'Minbar' );
		modalScope['minimize'] = minimize;
		modalScope['maximize'] = maximize;
		modalScope['close'] = close;

		const body: HTMLElement = this.$document.find( 'body' ).eq( 0 )[0];
		const modalElemTemplate = angular.element( `
			<gj-game-play-modal
				game="game"
				build="build"
				can-minimize="canMinimize"
				minimize="minimize()"
				maximize="maximize()"
				close="close()"
				>
			</gj-game-play-modal>`
		);
		const modalElem = this.$compile( modalElemTemplate )( modalScope );

		this.$animate.enter( modalElem, body );
		body.classList.add( 'game-play-modal-open' );

		// Pull into this scope.
		const $injector = this.$injector;
		const $animate = this.$animate;

		function minimize()
		{
			// We basically animate it out but keep it in the DOM.
			// This is so we don't lose the game when closing it.
			body.classList.remove( 'game-play-modal-open' );
			modalElem[0].style.display = 'none';

			// When this minbar item is clicked, it basically shows this modal again.
			const Minbar = $injector.get( 'Minbar' );
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
			if ( $injector.has( 'Game_RatingGrowl' ) ) {
				$injector.get( 'Game_RatingGrowl' ).show( _game );
			}
		}
	};
}
