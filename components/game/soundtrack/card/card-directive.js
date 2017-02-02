angular.module( 'gj.Game.Soundtrack.Card' ).directive( 'gjGameSoundtrackCard', function()
{
	return {
		restrict: 'E',
		template: require( '!html-loader!./card.html' ),
		scope: {
			game: '=gameSoundtrackCardGame',
			songs: '=gameSoundtrackCardSongs',
		},
		controllerAs: 'ctrl',
		bindToController: true,
		controller: function( $scope, $state, Screen, Environment )
		{
			var _this = this;

			$scope.Screen = Screen;

			this.isPlaying = false;
			this.isShowingSoundtrack = false;
			this.canToggleSoundtrack = undefined;

			$scope.$watch( 'ctrl.isPlaying', function( isPlaying )
			{
				// If we're playing, make sure the full soundtrack is open.
				if ( isPlaying ) {
					_this.isShowingSoundtrack = true;
				}
			} );

			this.download = function()
			{
				if ( Environment.isClient ) {
					var gui = require( 'nw.gui' );
					gui.Shell.openExternal( Environment.baseUrl + $state.href( 'discover.games.view.download.soundtrack', { slug: this.game.slug, id: this.game.id } ) );
				}
				else {
					$state.go( 'discover.games.view.download.soundtrack', { slug: this.game.slug, id: this.game.id } );
				}
			};
		}
	};
} );
