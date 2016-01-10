angular.module( 'gj.Game.Rating' ).factory( 'Game_Rating', function( Model, Api )
{
	function Game_Rating( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}
	}

	Game_Rating.prototype.$save = function()
	{
		// This is an upsert.
		return this.$_save( '/web/discover/games/ratings/save/' + this.game_id, 'gameRating', { ignoreLoadingBar: true } );
	};

	Game_Rating.prototype.$remove = function()
	{
		// This is a clear.
		// Doesn't depend on the rating ID, only the game ID.
		return this.$_remove( '/web/discover/games/ratings/clear/' + this.game_id, { ignoreLoadingBar: true } );
	};

	return Model.create( Game_Rating );
} );
