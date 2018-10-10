import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import { Model } from '../../../model/model.service';

export class FiresidePostCommunity extends Model {
	fireside_post_id!: number;
	community!: Community;
	added_on!: number;

	constructor(data: any = {}) {
		super(data);

		if (data.community) {
			this.community = new Community(data.community);
		}
	}
}

Model.create(FiresidePostCommunity);
