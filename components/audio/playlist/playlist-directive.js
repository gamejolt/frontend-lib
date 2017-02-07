angular.module( 'gj.Audio.Playlist' ).directive( 'gjAudioPlaylist', function()
{
	return {
		restrict: 'E',
		template: require( '!html-loader!./playlist.html' ),
		scope: {
			songs: '=audioPlaylistSongs',
			isPlaying: '=?audioPlaylistIsPlaying',
		},
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function( $scope )
		{
			var _this = this;

			this.toggleSong = function( song )
			{
				if ( this.currentSong && this.currentSong.id == song.id ) {
					this.stopSong();
				}
				else {
					this.playSong( song );
				}
			};

			this.playSong = function( song )
			{
				this.currentSong = song;
				this.isPlaying = true;
			};

			this.stopSong = function()
			{
				this.isPlaying = false;
			};

			this.mainSongButton = function()
			{
				if ( !this.currentSong ) {
					this.playSong( this.songs[0] );
				}
				else {
					this.stopSong();
				}
			};

			this.onSongEnded = function()
			{
				// If last song, just stop.
				if ( this.currentSong.id == this.songs[ this.songs.length - 1 ].id ) {
					this.stopSong();
				}
				else {
					var currentIndex = _.findIndex( this.songs, { id: this.currentSong.id } );
					this.playSong( this.songs[ currentIndex + 1 ] );
				}
			};

			if ( this.isPlaying ) {
				this.mainSongButton();
			}

			$scope.$watch( 'ctrl.isPlaying', function( isPlaying )
			{
				if ( !isPlaying ) {
					_this.currentSong = undefined;
					_this.currentSongTime = undefined;
					_this.currentSongDuration = undefined;
				}
				else {
					if ( !_this.currentSong ) {
						_this.mainSongButton();
					}
				}
			} );
		}
	};
} );
