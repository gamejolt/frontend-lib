import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./linked-account.html?style=./linked-account.styl';

import { LinkedAccount } from './linked-account.model';
import { AppJolticon } from '../../vue/components/jolticon/jolticon';
import { AppCard } from '../card/card';

@View
@Component({
	components: { AppJolticon, AppCard },
})
export class AppLinkedAccount extends Vue {
	@Prop(LinkedAccount) account: LinkedAccount | null;
	@Prop(String) provider: string;
	@Prop(Boolean) preview: boolean;
	@Prop(Boolean) spanWidth: boolean;

	get providerIcon() {
		const provider = this.getProvider();
		return LinkedAccount.getPlatformIcon(provider);
	}

	get providerName() {
		const provider = this.getProvider();
		return LinkedAccount.getProviderDisplayName(provider);
	}

	get platformLink() {
		if (this.account) {
			return this.account.platformLink;
		}
	}

	get isAccountSet() {
		return !!this.account && this.account.provider_id && this.account.name;
	}

	get mainClass() {
		return this.spanWidth ? '' : 'col-md-6 ' + 'linked-account';
	}

	private getProvider() {
		return this.account ? this.account.provider : this.provider;
	}

	onSync(e: Event) {
		this.$emit('sync', e, this.getProvider());
	}

	onUnlink(e: Event) {
		this.$emit('unlink', e, this.getProvider());
	}

	onLink(e: Event) {
		this.$emit('link', e, this.getProvider());
	}
}
