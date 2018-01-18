import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./join.html';
import './join.styl';

import { Connection } from '../../connection/connection-service';
import { AppJolticon } from '../../../vue/components/jolticon/jolticon';
import { FormModel, AppAuthJoinForm } from './join-form';
import { Environment } from '../../environment/environment.service';
import { UserLinkedAccounts } from '../../user/linked-accounts/linked-accounts.service';

@View
@Component({
	components: {
		AppJolticon,
		AppAuthJoinForm,
	},
})
export class AppAuthJoin extends Vue {
	@Prop(Boolean) darkVariant?: boolean;
	@Prop({ type: Boolean, default: true })
	shouldRedirect?: boolean;

	readonly Connection = Connection;

	/**
	 * Sign up is just login without an account. It'll direct to the correct
	 * page when it figures out if they have an account in the callback URL.
	 */
	linkedAccountLogin(provider: any) {
		UserLinkedAccounts.login(this.$router, provider);
	}

	onJoining(formModel: FormModel) {
		this.$emit('joining', formModel);

		if (this.shouldRedirect) {
			let url = Environment.authBaseUrl + '/join/almost';
			if (formModel.token) {
				url += '/' + formModel.token;
			}
			window.location.href = url;
		}
	}
}
