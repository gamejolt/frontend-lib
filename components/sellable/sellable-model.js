angular.module( 'gj.Sellable' ).factory( 'Sellable', function( Model )
{
	function Sellable( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}
	}

	return Model.create( Sellable );
} );
