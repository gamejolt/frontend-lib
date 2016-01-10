angular.module( 'gj.User.Message' ).factory( 'User_Message', function( Model, Api, User )
{
	function User_Message( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}

		if ( this.user ) {
			this.user = new User( this.user );
		}
	}

	return Model.create( User_Message );
} );
