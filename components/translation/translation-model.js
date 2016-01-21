angular.module( 'gj.Translation' ).factory( 'Translation', function( Model )
{
	function Translation( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}
	}

	return Model.create( Translation );
} );
