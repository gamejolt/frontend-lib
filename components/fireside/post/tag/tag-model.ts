import { Injectable } from 'ng-metadata/core';
import { Model } from './../../../model/model';

export function Fireside_Post_TagFactory( $state )
{
	return Model.create( Fireside_Post_Tag, {
		$state,
	} );
}

@Injectable()
export class Fireside_Post_Tag extends Model
{
	fireside_post_id: number;
	tag: string;
	added_on: number;

	static $state: any;

	getSref( page?: number, includeParams?: boolean )
	{
		let sref = 'tags.view';

		if ( includeParams ) {
			sref += '( ' + angular.toJson( this.getSrefParams( page ) ) + ' )';
		}

		return sref;
	}

	getSrefParams( page?: number )
	{
		return { tag: this.tag, page: page };
	}

	getUrl( page?: number )
	{
		return Fireside_Post_Tag.$state.href( this.getSref( page ), this.getSrefParams( page ) );
	}
}
