import { getProvider } from '../../utils/utils';

export class Translate
{
	static getString( str: string )
	{
		if ( GJ_IS_ANGULAR ) {
			const gc = getProvider<any>( 'gettextCatalog' );
			return gc.getString( str );
		}

		return str;
	}
}
