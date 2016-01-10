angular.module( 'gj.Game.Screenshot' ).factory( 'Game_Screenshot', function( Model, MediaItem )
{
	function Game_Screenshot( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}

		if ( this.media_item ) {
			this.media_item = new MediaItem( this.media_item );
		}
	}

	Game_Screenshot.prototype.getUrl = function( game )
	{
		return game.getUrl() + '#screenshot-' + this.id;
	};

	Game_Screenshot.prototype.$save = function()
	{
		if ( !this.id ) {
			return this.$_save( '/web/dash/developer/games/media/save/image/' + this.game_id, 'gameScreenshot', { file: this.file } );
		}
		else {
			return this.$_save( '/web/dash/developer/games/media/save/image/' + this.game_id + '/' + this.id, 'gameScreenshot' );
		}
	};

	Game_Screenshot.prototype.$remove = function()
	{
		return this.$_remove( '/web/dash/developer/games/media/remove/image/' + this.game_id + '/' + this.id );
	};

	return Model.create( Game_Screenshot );
} );
