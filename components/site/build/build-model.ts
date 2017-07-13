import { Model } from '../../model/model.service';

export class SiteBuild extends Model {
	static STATUS_ACTIVE = 'active';
	static STATUS_INACTIVE = 'inactive';
	static STATUS_REMOVED = 'removed';

	site_id: number;
	folder: string;
	status: string;
	added_on: number;

	// Set by the site build form with the file to upload
	file?: File;
}

Model.create(SiteBuild);
