angular.module( 'gj.User.GameSession' ).factory( 'User_GameSession', function( Model, Game )
{
	function User_GameSession( data )
	{
		if ( data ) {
			angular.extend( this, data );

			if ( data.game ) {
				this.game = new Game( data.game );
			}
		}
	}

	return Model.create( User_GameSession );
} );
