angular.module( 'gj.LinkedKey' ).factory( 'LinkedKey', function( Model )
{
	function LinkedKey( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}
	}

	LinkedKey.PROVIDER_STEAM = 'steam';

	return Model.create( LinkedKey );
} );
