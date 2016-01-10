angular.module( 'gj.GamePlaylist.Game' ).factory( 'GamePlaylist_Game', function( Model, Api )
{
	function GamePlaylist_Game( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}
	}

	GamePlaylist_Game.prototype.$save = function()
	{
		return this.$_save( '/web/library/games/add/playlist/' + this.game_playlist_id, 'gamePlaylistGame' );
	};

	GamePlaylist_Game.prototype.$remove = function()
	{
		return this.$_remove( '/web/library/games/remove/playlist/' + this.game_id + '/' + this.game_playlist_id );
	};

	return Model.create( GamePlaylist_Game );
} );
