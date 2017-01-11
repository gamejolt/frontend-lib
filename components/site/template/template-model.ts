import { Injectable } from 'ng-metadata/core';
import { Model } from '../../model/model-service';

export function SiteTemplateFactory( Model: any )
{
	return Model.create( SiteTemplate, {
	} );
}

@Injectable()
export class SiteTemplate extends Model
{
	key: string;
	name: string;
	description: string;
	data: any;
	user: any;

	constructor( data?: any )
	{
		super( data );

		if ( data && data.data ) {
			this.data = JSON.parse( data.data ) || {};
		}
	}
}
