import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./join.html';
import './join.styl';

import { Connection } from '../../connection/connection-service';
import { makeObservableService } from '../../../utils/vue';
import { AppJolticon } from '../../../vue/components/jolticon/jolticon';
import { AppAuthJoinForm } from './join-form';
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
	@Prop([Boolean])
	darkVariant?: boolean;
	@Prop([Boolean])
	shouldRedirect?: boolean;

	Connection = makeObservableService(Connection);

	/**
	 * Sign up is just login without an account. It'll direct to the correct
	 * page when it figures out if they have an account in the callback URL.
	 */
	linkedAccountLogin(provider: any) {
		UserLinkedAccounts.login(this.$router, provider);
	}

	onJoined(formModel: any) {
		this.$emit('joined', formModel);

		if (this.shouldRedirect) {
			window.location.href = Environment.authBaseUrl + '/join/almost';
		}
	}
}
