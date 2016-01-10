angular.module( 'gj.Game.PlayModal' ).service( 'Game_PlayModal', function( $q, $modal, Growls, HistoryTick )
{
	var _this = this;

	this.hasModal = false;

	this.show = function( _game, _build )
	{
		if ( this.hasModal ) {
			Growls.error( 'You already have a browser game open. You can only have one running at a time.', 'Oh no!' );
			return $q.reject();
		}

		this.hasModal = true;
		HistoryTick.sendBeacon( 'game-build', _build.id );

		var modalInstance = $modal.open( {

			// Don't want to allow it to close by pressing esc.
			// We also want to show the backdrop, but don't allow closing the window by clicking it.
			keyboard: false,
			backdrop: 'static',

			size: 'lg',
			windowClass: 'modal-dark game-play-modal',
			templateUrl: '/lib/gj-lib-client/components/game/play-modal/play-modal.html',
			controller: 'Game_PlayModalCtrl',
			controllerAs: 'modalCtrl',
			resolve: {
				game: function()
				{
					return _game;
				},
				build: function()
				{
					return _build;
				}
			}
		} );

		return modalInstance.result.finally( function()
		{
			_this.hasModal = false;
		} );
	};
} );
