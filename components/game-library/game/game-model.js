angular.module( 'gj.GameLibrary.Game' ).factory( 'GameLibrary_Game', function( Model, Api, Game )
{
	function GameLibrary_Game( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}

		if ( this.game && angular.isObject( this.game ) ) {
			this.game = new Game( this.game );
		}
	}

	GameLibrary_Game.prototype.$save = function()
	{
		return this.$_save( '/web/library/games/add/followed', 'gameLibraryGame' );
	};

	GameLibrary_Game.prototype.$remove = function()
	{
		return this.$_remove( '/web/library/games/remove/followed/' + this.game_id );
	};

	return Model.create( GameLibrary_Game );
} );
