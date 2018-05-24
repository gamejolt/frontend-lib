import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./login-form.html?style=./login-form.styl';

import { Connection } from '../../connection/connection-service';
import { BaseForm, FormOnSubmit } from '../../form-vue/form.service';
import { AppLoading } from '../../../vue/components/loading/loading';
import { Api } from '../../api/api.service';
import { Provider, UserLinkedAccounts } from '../../user/linked-accounts/linked-accounts.service';
import { AppTooltip } from '../../tooltip/tooltip';
import { Environment } from '../../environment/environment.service';

@View
@Component({
	components: {
		AppLoading,
	},
	directives: {
		AppTooltip,
	},
})
export class AppAuthLoginForm extends BaseForm<any> implements FormOnSubmit {
	@Prop(Boolean) darkVariant?: boolean;

	warnOnDiscard = false;

	invalidLogin = false;
	blockedLogin = false;

	readonly Connection = Connection;
	readonly Environment = Environment;

	onChanged() {
		this.resetErrors();
	}

	resetErrors() {
		this.invalidLogin = false;
		this.blockedLogin = false;
	}

	async onSubmit() {
		this.resetErrors();

		const response = await Api.sendRequest('/web/auth/login', this.formModel);

		if (response.success === false) {
			if (response.reason) {
				if (response.reason === 'invalid-login') {
					this.invalidLogin = true;
				} else if (response.reason === 'blocked') {
					this.blockedLogin = true;
				}
			}
		}

		return response;
	}

	linkedChoose(provider: Provider) {
		UserLinkedAccounts.login(this.$router, provider);
	}
}
