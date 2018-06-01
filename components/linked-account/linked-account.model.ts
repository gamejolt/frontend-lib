import { Model } from '../model/model.service';
import { User } from '../user/user.model';
import { Game } from '../game/game.model';

export type Provider = 'twitter' | 'facebook' | 'twitch' | 'google';

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

	static getProviderDisplayName(provider: string) {
		switch (provider) {
			case LinkedAccount.PROVIDER_FACEBOOK:
				return 'Facebook';
			case LinkedAccount.PROVIDER_TWITTER:
				return 'Twitter';
			case LinkedAccount.PROVIDER_GOOGLE:
				return 'Google+';
			case LinkedAccount.PROVIDER_TWITCH:
				return 'Twitch';
		}
		return 'Invalid provider';
	}

	get platformLink() {
		switch (this.provider) {
			case LinkedAccount.PROVIDER_FACEBOOK:
				return `https://facebook.com/${this.provider_id}`;
			case LinkedAccount.PROVIDER_TWITTER:
				return `https://twitter.com/${this.name}`;
			case LinkedAccount.PROVIDER_GOOGLE:
				return `https://plus.google.com/${this.provider_id}`;
			case LinkedAccount.PROVIDER_TWITCH:
				return `https://twitch.tv/${this.name}`;
		}
		return 'Invalid provider';
	}
}

Model.create(LinkedAccount);
