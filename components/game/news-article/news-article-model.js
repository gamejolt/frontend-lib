angular.module( 'gj.Game.NewsArticle' ).factory( 'Game_NewsArticle', function( Model, User, Game, Notification, KeyGroup )
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

			if ( data.key_groups ) {
				this.key_groups = KeyGroup.populate( data.key_groups );
			}
		}
	}

	Game_NewsArticle.prototype.$save = function()
	{
		var options = {
			allowComplexData: [ 'keyGroups' ],
		};

		if ( this.id ) {
			return this.$_save( '/web/dash/developer/games/news/save/' + this.game_id + '/' + this.id, 'newsArticle', options );
		}
		else {
			return this.$_save( '/web/dash/developer/games/news/save/' + this.game_id, 'newsArticle', options );
		}
	};

	Game_NewsArticle.prototype.$remove = function()
	{
		return this.$_remove( '/web/dash/developer/games/news/remove/' + this.game_id + '/' + this.id );
	};

	return Model.create( Game_NewsArticle );
} );
