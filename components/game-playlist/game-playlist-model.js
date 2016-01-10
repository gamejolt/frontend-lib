angular.module( 'gj.GamePlaylist' ).factory( 'GamePlaylist', function( Model, Api, GamePlaylist_Game, User )
{
	function GamePlaylist( data )
	{
		if ( data ) {
			angular.extend( this, data );

			if ( data.user ) {
				this.user = new User( data.user );
			}
		}
	}

	GamePlaylist.fetchPlaylists = function( options )
	{
		options = options || {};

		var queryString = '';
		if ( options.gameId ) {
			queryString += '?game_id=' + options.gameId;
		}

		return Api.sendRequest( '/web/library/playlists' + queryString, null, { ignoreLoadingBar: true } ).then( function( response )
		{
			return {
				playlists: GamePlaylist.populate( response.playlists ),
				playlistsWithGame: response.playlistsWithGame || [],
			};
		} );
	};

	GamePlaylist.prototype.$addGame = function( gameId )
	{
		var playlistGame = new GamePlaylist_Game();
		playlistGame.game_playlist_id = this.id;
		playlistGame.game_id = gameId;

		return playlistGame.$save().then( function()
		{
			return playlistGame;
		} );
	};

	GamePlaylist.prototype.$removeGame = function( gameId )
	{
		var playlistGame = new GamePlaylist_Game();
		playlistGame.game_playlist_id = this.id;
		playlistGame.game_id = gameId;

		return playlistGame.$remove();
	};

	GamePlaylist.prototype.$save = function()
	{
		if ( !this.id ) {
			return this.$_save( '/web/library/playlists/save', 'gamePlaylist' );
		}
		else {
			return this.$_save( '/web/library/playlists/save/' + this.id, 'gamePlaylist' );
		}
	};

	GamePlaylist.prototype.$remove = function()
	{
		return this.$_remove( '/web/library/playlists/remove/' + this.id );
	};

	return Model.create( GamePlaylist );
} );
