angular.module( 'gj.Game.NewsArticle' ).factory( 'Game_NewsArticle', function( Model, User, Game, Notification )
{
	function Game_NewsArticle( data )
	{
		if ( data ) {
			angular.extend( this, data );

			if ( data.game ) {
				this.game = new Game( data.game );
			}

			if ( data.notification ) {
				this.notification = new Notification( data.notification );
			}
		}
	}

	Game_NewsArticle.prototype.$save = function()
	{
		if ( this.id ) {
			return this.$_save( '/web/dash/developer/games/news/save/' + this.game_id + '/' + this.id, 'newsArticle' );
		}
		else {
			return this.$_save( '/web/dash/developer/games/news/save/' + this.game_id, 'newsArticle' );
		}
	};

	Game_NewsArticle.prototype.$remove = function()
	{
		return this.$_remove( '/web/dash/developer/games/news/remove/' + this.game_id + '/' + this.id );
	};

	return Model.create( Game_NewsArticle );
} );
