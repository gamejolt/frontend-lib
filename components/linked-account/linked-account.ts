import View from '!view!./linked-account.html?style=./linked-account.styl';
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { AppJolticon } from '../../vue/components/jolticon/jolticon';
import { AppCard } from '../card/card';
import {
	getLinkedAccountPlatformIcon,
	getLinkedAccountProviderDisplayName,
	LinkedAccount,
} from './linked-account.model';

@View
@Component({
	components: { AppJolticon, AppCard },
})
export class AppLinkedAccount extends Vue {
	@Prop(LinkedAccount)
	account!: LinkedAccount | null;

	@Prop(String)
	provider!: string;

	@Prop(Boolean)
	preview?: boolean;

	@Prop(Boolean)
	spanWidth?: boolean;

	@Prop(Boolean)
	disabled?: boolean;

	get providerIcon() {
		const provider = this.getProvider();
		return getLinkedAccountPlatformIcon(provider);
	}

	get providerName() {
		const provider = this.getProvider();
		return getLinkedAccountProviderDisplayName(provider);
	}

	get platformLink() {
		if (this.account) {
			return this.account.platformLink;
		}
	}

	get isAccountSet() {
		return !!this.account && this.account.provider_id && this.account.name;
	}

	private getProvider() {
		return this.account ? this.account.provider : this.provider;
	}

	@Emit('sync')
	emitSync(_provider: string) {}

	@Emit('unlink')
	emitUnlink(_provider: string) {}

	@Emit('link')
	emitLink(_provider: string) {}

	onSync() {
		this.emitSync(this.getProvider());
	}

	onUnlink() {
		this.emitUnlink(this.getProvider());
	}

	onLink() {
		this.emitLink(this.getProvider());
	}
}
