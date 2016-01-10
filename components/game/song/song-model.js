angular.module( 'gj.Game.Song' ).factory( 'Game_Song', function( Model, Api )
{
	function Game_Song( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}
	}

	Game_Song.getSoundtrackDownloadUrl = function( gameId )
	{
		return Api.sendRequest( '/web/discover/games/audio/get-soundtrack-download-url/' + gameId, null, {
			ignoreLoadingBar: true
		} );
	};

	Game_Song.$saveSort = function( gameId, sort )
	{
		return Api.sendRequest( '/web/dash/developer/games/music/save-sort/' + gameId, sort );
	};

	Game_Song.prototype.$save = function()
	{
		if ( !this.id ) {
			return this.$_save( '/web/dash/developer/games/music/save/' + this.game_id, 'gameSong', { file: this.file } );
		}
		else {
			// May or may not have an upload file on an edit.
			return this.$_save( '/web/dash/developer/games/music/save/' + this.game_id + '/' + this.id, 'gameSong', { file: this.file || null } );
		}
	};

	Game_Song.prototype.$remove = function()
	{
		return this.$_remove( '/web/dash/developer/games/music/remove/' + this.game_id + '/' + this.id );
	};

	return Model.create( Game_Song );
} );
