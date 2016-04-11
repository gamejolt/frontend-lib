angular.module( 'gj.Game.PlayModal' ).controller( 'Game_PlayModalOldCtrl', function( $modalInstance, $document, $injector, $animate, $modalStack, game, build )
{
	var _this = this;

	var body = $document.find( 'body' ).eq( 0 );
	var modal, backdrop;

	this.game = game;
	this.build = build;
	this.canMinimize = $injector.has( 'Minbar' );

	// If the game has ads turned off, set it as "shown" initially.
	this.adShown = !this.game._should_show_ads ? true : false;
	this.onAdShown = function()
	{
		this.adShown = true;
	};

	this.close = function()
	{
		$modalInstance.dismiss();

		// Show a rating growl when they close the game play modal.
		// This will urge them to rate the game after playing it, but only if they haven't
		// rated it yet.
		if ( $injector.has( 'Game_RatingGrowl' ) ) {
			$injector.get( 'Game_RatingGrowl' ).show( this.game );
		}
	};

	this.minimize = function()
	{
		if ( !this.canMinimize ) {
			throw new Error( 'Can not minimize game play modal because there is no minbar.' );
		}

		// Pull from the top of the modal stack.
		// This is different than the modalInstance.
		// It includes the dom element and scope of the modal.
		modal = $modalStack.getTop().value;

		// We basically animate it out but keep it in the DOM.
		// This is so we don't lose the game when closing it.
		body.removeClass( 'modal-open' );

		backdrop = angular.element( body[0].querySelector( '.modal-backdrop' ) );
		$animate.addClass( backdrop, 'minimize' ).then( function()
		{
			backdrop.css( { display: 'none' } );
		} );

		$animate.addClass( modal.modalDomEl, 'minimize' ).then( function()
		{
			modal.modalDomEl.css( { display: 'none' } );
		} );


		// When this minbar item is clicked, it basically shows this modal again.
		var Minbar = $injector.get( 'Minbar' );
		var minbarItem = Minbar.add( {
			title: game.title,
			thumb: game.img_thumbnail,
			isActive: true,  // Only one game open at a time, so make it active.
			onClick: function()
			{
				// We remove the item from the minbar.
				Minbar.remove( minbarItem );

				// Then we show the modal again.
				_this.maximize();
			}
		} );
	};

	this.maximize = function()
	{
		// Add everything back in!
		body.addClass( 'modal-open' );

		backdrop.css( { display: 'block' } );
		modal.modalDomEl.css( { display: 'block' } )

		$animate.removeClass( backdrop, 'minimize' );
		$animate.removeClass( modal.modalDomEl, 'minimize' );
	};
} );
