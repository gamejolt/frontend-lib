import { parse } from 'qs';

export class PartnerReferral
{
	static trackReferrer( resource: string, resourceId: number )
	{
		const queryParams = parse( window.location.search.substring( 1 ) );
		const ref = queryParams['ref'];

		if ( ref ) {
			window.sessionStorage.setItem( `partner-ref:${resource}:${resourceId}`, ref );
		}
	}

	static getReferrer( resource: string, resourceId: number )
	{
		return window.sessionStorage.getItem( `partner-ref:${resource}:${resourceId}` );
	}
}
