import { Model } from '../model/model.service';
import { User } from '../user/user.model';
import { Game } from '../game/game.model';

export class LinkedAccount extends Model {
	static readonly PROVIDER_FACEBOOK = 'facebook';
	static readonly PROVIDER_TWITTER = 'twitter';
	static readonly PROVIDER_GOOGLE = 'google';
	static readonly PROVIDER_TWITCH = 'twitch';

	user: User | null;
	game: Game | null;

	provider: string;
	provider_id: string;
	name: string;

	constructor(data: any = {}) {
		super(data);

		if (data.user) {
			this.user = new User(data.user);
		}

		if (data.game) {
			this.game = new Game(data.game);
		}
	}
}

Model.create(LinkedAccount);
