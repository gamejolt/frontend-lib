angular.module( 'gj.Game.Build.Param' ).factory( 'Game_Build_Param', function( Model )
{
	function Game_Build_Param( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}
	}

	return Model.create( Game_Build_Param );
} );
