angular.module( 'gj.Sellable' ).factory( 'Sellable', function( Model, Sellable_Pricing )
{
	function Sellable( data )
	{
		if ( data ) {
			angular.extend( this, data );

			if ( data.pricings ) {
				this.pricings = Sellable_Pricing.populate( data.pricings );
			}
		}
	}

	return Model.create( Sellable );
} );
