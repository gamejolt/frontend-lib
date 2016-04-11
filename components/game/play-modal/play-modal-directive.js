angular.module( 'gj.Game.PlayModal' ).directive( 'gjGamePlayModal', function()
{
	return {
		templateUrl: '/lib/gj-lib-client/components/game/play-modal/play-modal.html',
		scope: {
			game: '=gjGame',
			build: '=gjBuild',
			canMinimize: '=',
			minimize: '&',
			maximize: '&',
			close: '&',
		},
		controllerAs: 'ctrl',
		bindToController: true,
		controller: function( $injector, $document, $element )
		{
			var _this = this;

			// var body = $document.find( 'body' ).eq( 0 );

			// this.canMinimize = $injector.has( 'Minbar' );

			// If the game has ads turned off, set it as "shown" initially.
			this.adShown = !this.game._should_show_ads;

			this.onAdShown = function()
			{
				this.adShown = true;
			};
		}
	};
} );
