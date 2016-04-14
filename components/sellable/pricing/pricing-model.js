angular.module( 'gj.Sellable.Pricing' ).factory( 'Sellable_Pricing', function( Model )
{
	function Sellable_Pricing( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}
	}

	return Model.create( Sellable_Pricing );
} );
