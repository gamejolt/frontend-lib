import { getProvider } from '../../utils/utils';

export function currency( amount: number, currencySymbol: string ): string
{
	const currencyFilter = getProvider<any>( 'currencyFilter' );

	// No fraction/decimal.
	if ( amount % 100 === 0 ) {
		return currencyFilter( amount / 100, currencySymbol, 0 );
	}

	return currencyFilter( amount / 100, currencySymbol );
}
