import { Model } from '../../../model/model.service';
import { User } from '../../../user/user.model';

export class FiresidePostLike extends Model {
	fireside_post_id!: number;
	user_id!: number;
	user?: User;
	added_on!: number;

	constructor(data: any = {}) {
		super(data);

		if (data.user) {
			this.user = new User(data.user);
		}
	}

	$save() {
		if (this.id) {
			throw new Error(`Can't update like data`);
		}

		return this.$_save('/posts/votes/like/' + this.fireside_post_id, 'firesidePostLike', {
			ignorePayloadUser: true,
		});
	}

	$remove() {
		return this.$_remove('/posts/votes/unlike/' + this.fireside_post_id, {
			ignorePayloadUser: true,
		});
	}
}

Model.create(FiresidePostLike);
