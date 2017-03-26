export function currency( amount: number, currencySymbol = '$', decimal = 2 ): string
{
	// No fraction/decimal.
	if ( amount % 100 === 0 ) {
		return currencySymbol + (amount / 100).toFixed( 0 );
	}

	return currencySymbol + (amount / 100).toFixed( decimal );
}
