import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./join-form.html';

import { Connection } from '../../connection/connection-service';
import { FormOnSubmit, BaseForm, FormOnSubmitSuccess } from '../../form-vue/form.service';
import { AppLoading } from '../../../vue/components/loading/loading';
import { Api } from '../../api/api.service';

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
	},
})
export class AppAuthJoinForm extends BaseForm<FormModel>
	implements FormOnSubmit, FormOnSubmitSuccess {
	@Prop(Boolean) darkVariant?: boolean;

	warnOnDiscard = false;

	readonly Connection = Connection;

	onSubmit() {
		return Api.sendRequest('/web/auth/join', this.formModel);
	}

	onSubmitSuccess(response: any) {
		this.setField('token', response.token);
	}
}
