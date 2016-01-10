angular.module( 'gj.User.GameTrophy' ).factory( 'User_GameTrophy', function( Model )
{
	function User_GameTrophy( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}
	}

	return Model.create( User_GameTrophy );
} );
