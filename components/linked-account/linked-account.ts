import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./linked-account.html?style=./linked-account.styl';

import { LinkedAccount } from './linked-account.model';
import { AppJolticon } from '../../vue/components/jolticon/jolticon';

@View
@Component({
	components: { AppJolticon },
})
export class AppLinkedAccount extends Vue {
	@Prop(LinkedAccount) account: LinkedAccount | null;
	@Prop(String) provider: string;

	get providerIcon() {
		const provider = this.getProvider();
		switch (provider) {
			case LinkedAccount.PROVIDER_FACEBOOK:
				return 'facebook';
			case LinkedAccount.PROVIDER_TWITTER:
				return 'twitter-bird';
			case LinkedAccount.PROVIDER_GOOGLE:
				return 'google-plus';
			case LinkedAccount.PROVIDER_TWITCH:
				return 'twitch';
		}
		// invalid provider
		return 'remove';
	}

	get providerName() {
		const provider = this.getProvider();
		return LinkedAccount.getProviderDisplayName(provider);
	}

	get platformLink() {
		if (this.account) {
			const provider = this.getProvider();
			switch (provider) {
				case LinkedAccount.PROVIDER_FACEBOOK:
					return `https://facebook.com/${this.account.provider_id}`;
				case LinkedAccount.PROVIDER_TWITTER:
					return `https://twitter.com/${this.account.name}`;
				case LinkedAccount.PROVIDER_GOOGLE:
					return `https://plus.google.com/${this.account.provider_id}`;
				case LinkedAccount.PROVIDER_TWITCH:
					return `https://twitch.tv/${this.account.name}`;
			}
		}
		return 'Invalid provider';
	}

	get isAccountSet() {
		return !!this.account && this.account.provider_id && this.account.name;
	}

	private getProvider() {
		return this.account ? this.account.provider : this.provider;
	}

	onSync(e: Event) {
		this.$emit('sync', e);
	}

	onUnlink(e: Event) {
		this.$emit('unlink', e, this.getProvider());
	}

	onLink(e: Event) {
		this.$emit('link', e, this.getProvider());
	}
}
