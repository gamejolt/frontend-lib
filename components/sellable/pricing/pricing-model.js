angular.module( 'gj.Sellable.Pricing' ).factory( 'Sellable_Pricing', function( Model )
{
	function Sellable_Pricing( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}
	}

	Sellable_Pricing.getOriginalPricing = function( pricings )
	{
		if ( Array.isArray( pricings ) ) {
			if ( pricings[0].promotional ) {
				return pricings[1];
			}
			return pricings[0];
		}
		return undefined;
	};

	Sellable_Pricing.getPromotionalPricing = function( pricings )
	{
		if ( Array.isArray( pricings ) && pricings[0].promotional ) {
			return pricings[0];
		}
		return undefined;
	};

	return Model.create( Sellable_Pricing );
} );
