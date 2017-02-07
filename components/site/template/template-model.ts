import { Model } from '../../model/model.service';

export class SiteTemplate extends Model
{
	key: string;
	name: string;
	description: string;
	data: any;
	user: any;

	constructor( data: any = {} )
	{
		super( data );

		if ( data.data ) {
			this.data = JSON.parse( data.data ) || {};
		}
	}
}

Model.create( SiteTemplate );
