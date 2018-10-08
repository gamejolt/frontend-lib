import View from '!view!./login-form.html?style=./login-form.styl';
import { Provider } from 'game-jolt-frontend-lib/components/linked-account/linked-account.model';
import { LinkedAccounts } from 'game-jolt-frontend-lib/components/linked-account/linked-accounts.service';
import { Component, Prop } from 'vue-property-decorator';
import { AppLoading } from '../../../vue/components/loading/loading';
import { Api } from '../../api/api.service';
import { Connection } from '../../connection/connection-service';
import { Environment } from '../../environment/environment.service';
import { BaseForm, FormOnSubmit } from '../../form-vue/form.service';
import { AppTooltip } from '../../tooltip/tooltip';

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
	@Prop(Boolean)
	darkVariant?: boolean;

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
		LinkedAccounts.login(this.$router, provider);
	}
}
