import { Injectable, Inject } from 'ng-metadata/core';

@Injectable( 'PartnerReferral' )
export class PartnerReferral
{
	constructor(
		@Inject( '$window' ) private $window: ng.IWindowService,
		@Inject( '$location' ) private $location: ng.ILocationService,
	)
	{
	}

	trackReferrer( resource: string, resourceId: number )
	{
		const queryParams = this.$location.search();
		const ref = queryParams['ref'];

		if ( ref ) {
			this.$window.sessionStorage.setItem( `partner-ref:${resource}:${resourceId}`, ref );
		}
	}

	getReferrer( resource: string, resourceId: number )
	{
		return this.$window.sessionStorage.getItem( `partner-ref:${resource}:${resourceId}` );
	}
}
