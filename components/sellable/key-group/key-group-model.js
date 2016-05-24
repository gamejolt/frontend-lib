angular.module( 'gj.Sellable.KeyGroup' ).factory( 'Sellable_KeyGroup', function( Model )
{
	function Sellable_KeyGroup( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}
	}

	return Model.create( Sellable_KeyGroup );
} );
