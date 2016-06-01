angular.module( 'gj.LinkedKey' ).factory( 'LinkedKey', function( Model )
{
	function LinkedKey( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}
	}

	return Model.create( LinkedKey );
} );
