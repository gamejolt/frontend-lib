import { Model } from '../model/model.service';
import { User } from '../user/user.model';
import { Game } from '../game/game.model';

export type Provider = 'twitter' | 'facebook' | 'twitch' | 'google' | 'tumblr';

export type FacebookPage = {
	id: number;
	name: string;
};

export type TumblrBlog = {
	name: string;
	url: string;
	title: string;
};

export class LinkedAccount extends Model {
	static readonly PROVIDER_FACEBOOK = 'facebook';
	static readonly PROVIDER_TWITTER = 'twitter';
	static readonly PROVIDER_GOOGLE = 'google';
	static readonly PROVIDER_TWITCH = 'twitch';
	static readonly PROVIDER_TUMBLR = 'tumblr';
	static readonly PROVIDER_YOUTUBE = 'youtube';
	static readonly PROVIDER_YOUTUBE_CHANNEL = 'youtube-channel';

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
			case LinkedAccount.PROVIDER_TUMBLR:
				return null; // tumblr users don't have a page associated with them that we can show
		}
		return 'Invalid provider';
	}

	get icon() {
		return LinkedAccount.getPlatformIcon(this.provider);
	}

	get displayName() {
		return LinkedAccount.getProviderDisplayName(this.provider);
	}

	static getPlatformIcon(provider: string) {
		switch (provider) {
			case LinkedAccount.PROVIDER_FACEBOOK:
				return 'facebook';
			case LinkedAccount.PROVIDER_TWITTER:
				return 'twitter-bird';
			case LinkedAccount.PROVIDER_GOOGLE:
				return 'google-plus';
			case LinkedAccount.PROVIDER_TWITCH:
				return 'twitch';
			case LinkedAccount.PROVIDER_TUMBLR:
				return 'tumblr';
		}
		return 'remove'; // invalid provider
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
			case LinkedAccount.PROVIDER_TUMBLR:
				return 'Tumblr';
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

	get facebookPageUrl(): string | null {
		const selectedPage = this.facebookSelectedPage;
		if (selectedPage) {
			return 'https://facebook.com/' + selectedPage.id;
		}
		return null;
	}

	get tumblrSelectedBlog(): TumblrBlog | null {
		if (this.provider === LinkedAccount.PROVIDER_TUMBLR && this.extra_data) {
			const selectedBlog = this.extra_data.selectedBlog;
			if (selectedBlog) {
				console.log(JSON.stringify(selectedBlog));
				return selectedBlog;
			}
		}
		return null;
	}
}

Model.create(LinkedAccount);
