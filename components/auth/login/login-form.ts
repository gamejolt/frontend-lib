import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./login-form.html';

import { Connection } from '../../connection/connection-service';
import { makeObservableService } from '../../../utils/vue';
import { BaseForm, FormOnSubmit } from '../../form-vue/form.service';
import { AppLoading } from '../../../vue/components/loading/loading';
import { Api } from '../../api/api.service';

@View
@Component({
	components: {
		AppLoading,
	},
})
export class AppAuthLoginForm extends BaseForm<any> implements FormOnSubmit {
	@Prop(Boolean) darkVariant?: boolean;

	warnOnDiscard = false;

	invalidLogin = false;
	blockedLogin = false;

	Connection = makeObservableService(Connection);

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
}
