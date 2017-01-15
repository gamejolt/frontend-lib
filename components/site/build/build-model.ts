import { Injectable } from 'ng-metadata/core';
import { Model } from '../../model/model-service';

export function SiteBuildFactory( Model: any )
{
	return Model.create( SiteBuild, {
	} );
}

@Injectable()
export class SiteBuild extends Model
{
	static STATUS_ACTIVE = 'active';
	static STATUS_INACTIVE = 'inactive';
	static STATUS_REMOVED = 'removed';

	site_id: number;
	folder: string;
	status: string;
	added_on: number;

	file?: any;

	$save()
	{
		if ( !this.id ) {
			return this.$_save( '/web/dash/sites/upload-build/' + this.site_id, 'siteBuild', { file: this.file } );
		}
		else {
			throw new Error( `Can't edit site builds.` );
		}
	}

	$activate()
	{
		return this.$_save( '/web/dash/sites/activate-build/' + this.site_id + '/' + this.id, 'siteBuild' );
	}

	$remove()
	{
		return this.$_remove( '/web/dash/sites/remove-build/' + this.site_id + '/' + this.id );
	}
}
