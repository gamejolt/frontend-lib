import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./join-form.html?style=./join-form.styl';

import { Connection } from '../../connection/connection-service';
import { FormOnSubmit, BaseForm, FormOnSubmitSuccess } from '../../form-vue/form.service';
import { AppLoading } from '../../../vue/components/loading/loading';
import { Api } from '../../api/api.service';
import { UserLinkedAccounts, Provider } from '../../user/linked-accounts/linked-accounts.service';
import { AppTooltip } from '../../tooltip/tooltip';
import { Environment } from '../../environment/environment.service';
import { AppJolticon } from '../../../vue/components/jolticon/jolticon';

export type FormModel = {
	email: string;
	username: string;
	password: string;
	token: string;
};

@View
@Component({
	components: {
		AppLoading,
		AppJolticon,
	},
	directives: {
		AppTooltip,
	},
})
export class AppAuthJoinForm extends BaseForm<FormModel>
	implements FormOnSubmit, FormOnSubmitSuccess {
	@Prop(Boolean) darkVariant?: boolean;
	@Prop(Boolean) blocked?: boolean;

	warnOnDiscard = false;

	readonly Connection = Connection;
	readonly Environment = Environment;

	onSubmit() {
		return Api.sendRequest('/web/auth/join', this.formModel);
	}

	onSubmitSuccess(response: any) {
		this.setField('token', response.token);
	}

	/**
	 * Sign up is just login without an account. It'll direct to the correct page when it figures
	 * out if they have an account in the callback URL.
	 */
	linkedChoose(provider: Provider) {
		UserLinkedAccounts.login(this.$router, provider);
	}
}
