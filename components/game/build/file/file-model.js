angular.module( 'gj.Game.Build.File' ).factory( 'Game_Build_File', function( Model )
{
	function Game_Build_File( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}
	}

	return Model.create( Game_Build_File );
} );
