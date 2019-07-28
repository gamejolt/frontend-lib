import { Model } from '../../model/model.service';
import { BaseTrophy } from '../../trophy/base-trophy.model';
import { User } from '../user.model';

export abstract class UserBaseTrophy extends Model {
	user_id!: number;
	logged_on!: number;
	viewed_on?: number;

	user?: User;

	abstract get trophy(): BaseTrophy | undefined;

	abstract $view(): void;
}
