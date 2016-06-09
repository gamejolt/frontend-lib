angular.module( 'gj.Game.PlayModal' ).service( 'Game_PlayModal', function( $rootScope, $document, $q, $state, $compile, $animate, $injector, Growls, HistoryTick, Environment, Popover, Analytics, Game_Build )
{
	var _this = this;

	this.hasModal = false;

	this.show = function( _game, _build )
	{
		// Silly split test.
		var splitKey = 'split:play-modal';
		if ( !window.localStorage[ splitKey ] ) {
			if ( Math.random() * 100 <= 50 ) {
				window.localStorage[ splitKey ] = 'old';
			}
			else {
				window.localStorage[ splitKey ] = 'new';
			}
		}

		Analytics.trackEvent( 'game-play-modal-split', window.localStorage[ splitKey ] );
		if ( window.localStorage[ splitKey ] == 'old' ) {
			$injector.get( 'Game_PlayModalOld' ).show( _game, _build );
			return;
		}

		Analytics.trackEvent( 'game-play', 'play' );

		// TODO: This only goes to game page. We need to direct to a URL that would open the correct build in a modal.
		if ( Environment.isClient && _build.type != Game_Build.TYPE_HTML && _build.type != Game_Build.TYPE_ROM ) {
			nw.Shell.openExternal( Environment.baseUrl + $state.href( 'discover.games.view.overview', {
				slug: _game.slug,
				id: _game.id,
			} ) );

			// If they clicked into this through a popover.
			Popover.hideAll();

			return $q.resolve();
		}

		if ( this.hasModal ) {
			Growls.error( 'You already have a browser game open. You can only have one running at a time.', 'Oh no!' );
			return $q.reject();
		}

		this.hasModal = true;
		HistoryTick.sendBeacon( 'game-build', _build.id, { sourceResource: 'Game', sourceResourceId: _game.id } );

		var modalScope = $rootScope.$new( true );
		modalScope.game = _game;
		modalScope.build = _build;
		modalScope.canMinimize = $injector.has( 'Minbar' );
		modalScope.minimize = minimize;
		modalScope.maximize = maximize;
		modalScope.close = close;

		var modalElem = angular.element( '<gj-game-play-modal gj-game="game" gj-build="build" can-minimize="canMinimize" minimize="minimize()" maximize="maximize()" close="close()"></gj-game-play-modal>' );
		modalElem = $compile( modalElem )( modalScope );

		var body = $document.find( 'body' ).eq( 0 );
		$animate.enter( modalElem, body );
		body[0].classList.add( 'game-play-modal-open' );

		function minimize()
		{
			// if ( !this.canMinimize ) {
			// 	throw new Error( 'Can not minimize game play modal because there is no minbar.' );
			// }

			// We basically animate it out but keep it in the DOM.
			// This is so we don't lose the game when closing it.
			body.removeClass( 'game-play-modal-open' );
			modalElem[0].style.display = 'none';

			// When this minbar item is clicked, it basically shows this modal again.
			var Minbar = $injector.get( 'Minbar' );
			var minbarItem = Minbar.add( {
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
		};

		function maximize()
		{
			// Add everything back in!
			body.addClass( 'game-play-modal-open' );
			modalElem[0].style.display = 'block';
		};

		function close()
		{
			$animate.leave( modalElem ).then( function()
			{
				modalScope.$destroy();
				modalScope = undefined;
				modalElem = undefined;
				body.removeClass( 'game-play-modal-open' );

				_this.hasModal = false;
			} );

			// Show a rating growl when they close the game play modal.
			// This will urge them to rate the game after playing it, but only if they haven't
			// rated it yet.
			if ( $injector.has( 'Game_RatingGrowl' ) ) {
				$injector.get( 'Game_RatingGrowl' ).show( _game );
			}
		};
	};
} );
