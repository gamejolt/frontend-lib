import { Model } from '../model/model.service';
import { User } from '../user/user.model';
import { Game } from '../game/game.model';

export type Provider = 'twitter' | 'facebook' | 'twitch' | 'google';

export type FacebookPage = {
	id: number;
	name: string;
};

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
	extra_data: any;

	constructor(data: any = {}) {
		super(data);

		if (data.user) {
			this.user = new User(data.user);
		}

		if (data.game) {
			this.game = new Game(data.game);
		}

		if (data.extra_data) {
			this.extra_data = JSON.parse(data.extra_data);
		}
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

	// returns the name of the page selected for this facebook account
	get facebookSelectedPage(): FacebookPage | null {
		if (this.provider === LinkedAccount.PROVIDER_FACEBOOK && this.extra_data) {
			const selectedPage = this.extra_data.selectedPage;
			if (selectedPage) {
				return selectedPage;
			}
		}
		return null;
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

	get facebookPageUrl(): string | null {
		const selectedPage = this.facebookSelectedPage;
		if (selectedPage) {
			return 'https://facebook.com/' + selectedPage.id;
		}
		return null;
	}
}

Model.create(LinkedAccount);
