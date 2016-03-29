angular.module( 'gj.Currency' ).filter( 'gjCurrency', function( currencyFilter )
{
	return function( amount, currencySymbol )
	{
		// No fraction/decimal.
		if ( amount % 100 == 0 ) {
			return currencyFilter( amount / 100, currencySymbol, 0 );
		}

		return currencyFilter( amount / 100, currencySymbol );
	};
} );
