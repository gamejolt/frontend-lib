angular.module( 'gj.GameBundle' ).factory( 'GameBundle', function( Model )
{
	function GameBundle( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}
	}

	return Model.create( GameBundle );
} );
