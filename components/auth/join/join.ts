import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./join.html';
import './join.styl';

import { Connection } from '../../connection/connection-service';
import { AppJolticon } from '../../../vue/components/jolticon/jolticon';
import { FormModel, AppAuthJoinForm } from './join-form';
import { Environment } from '../../environment/environment.service';
import { UserLinkedAccounts } from '../../user/linked-accounts/linked-accounts.service';
import { Api } from '../../api/api.service';

@View
@Component({
	components: {
		AppJolticon,
		AppAuthJoinForm,
	},
})
export class AppAuthJoin extends Vue {
	@Prop(Boolean) darkVariant?: boolean;

	blocked = false;

	readonly Connection = Connection;

	async mounted() {
		const response = await Api.sendRequest('/web/auth/check');
		if (response.success && response.blocked) {
			this.blocked = true;
		}
	}

	/**
	 * Sign up is just login without an account. It'll direct to the correct
	 * page when it figures out if they have an account in the callback URL.
	 */
	linkedAccountLogin(provider: any) {
		UserLinkedAccounts.login(this.$router, provider);
	}

	onJoin(formModel: FormModel) {
		sessionStorage.setItem('signup-auth-token', formModel.token);
		sessionStorage.setItem('signup-username', formModel.username);
		sessionStorage.setItem('signup-password', formModel.password);

		if (GJ_SECTION !== 'auth') {
			window.location.href = `${Environment.authBaseUrl}/join/captcha`;
		} else {
			this.$router.push({
				name: 'auth.join-captcha',
			});
		}
	}
}
