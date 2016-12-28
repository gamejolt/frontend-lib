import { Injectable, Inject } from 'ng-metadata/core';

@Injectable()
export class TranslateSpoof
{
	constructor(
		@Inject( '$interpolate' ) private $interpolate: ng.IInterpolateService,
	)
	{
	}

	getString( str: string, scope?: any )
	{
		if ( scope ) {
			return this.$interpolate( str )( scope );
		}

		return str;
	}
}
