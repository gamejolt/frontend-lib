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

	return Model.create( GameLibrary_Game );
} );
