angular.module( 'gj.User.GameScore' ).factory( 'User_GameScore', function( Model, User )
{
	function User_GameScore( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}

		if ( this.user ) {
			this.user = new User( this.user );
		}
	}

	User_GameScore.prototype.$remove = function()
	{
		return this.$_remove( '/web/dash/developer/games/api/scores/remove-score/'+ this.game_id + '/' + this.id );
	};

	return Model.create( User_GameScore );
} );
