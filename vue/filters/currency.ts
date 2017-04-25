export function currency( amount: number, currencySymbol = '$', decimal = 2 ): string
{
	// No fraction/decimal.
	if ( amount % 100 === 0 || decimal === 0 ) {
		return currencySymbol + Math.floor( amount / 100 );
	}

	return currencySymbol + (amount / 100).toFixed( decimal );
}
