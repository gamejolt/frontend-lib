import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./login.html';
import './login.styl';

import { Connection } from '../../connection/connection-service';
import { makeObservableService } from '../../../utils/vue';
import { AppJolticon } from '../../../vue/components/jolticon/jolticon';
import { AppAuthLoginForm } from './login-form';
import { Auth } from '../auth.service';
import { UserLinkedAccounts } from '../../user/linked-accounts/linked-accounts.service';
import { Environment } from '../../environment/environment.service';

@View
@Component({
	components: {
		AppJolticon,
		AppAuthLoginForm,
	},
})
export class AppAuthLogin extends Vue {
	@Prop([Boolean])
	darkVariant?: boolean;
	@Prop([String])
	redirectTo: string;

	Connection = makeObservableService(Connection);

	onLoggedIn() {
		if (this.redirectTo) {
			// We don't want them to be able to put in an offsite link as the
			// redirect URL. So we only open up certain domains. Otherwise we
			// simply attach it to the main domain.

			// Subdomain redirect: jams.gamejolt.io, fireside.gamejolt.com, etc.
			// This also handles main domain.
			if (
				this.redirectTo.search(
					/^https?:\/\/([a-zA-Z\.]+\.)?gamejolt.(com|io)/
				) !== -1
			) {
				window.location.href = this.redirectTo;
				return;
			}

			// Normal redirect, within the gamejolt.com domain.
			// This is domain-less so we we'll redirect to the path.
			window.location.href = Environment.baseUrl + this.redirectTo;
			return;
		}

		Auth.redirectDashboard();
	}

	linkedAccountLogin(provider: any) {
		UserLinkedAccounts.login(this.$router, provider);
	}
}
