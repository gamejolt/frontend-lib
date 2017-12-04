import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./join-form.html';

import { Connection } from '../../connection/connection-service';
import { FormOnSubmit, BaseForm } from '../../form-vue/form.service';
import { AppLoading } from '../../../vue/components/loading/loading';
import { Api } from '../../api/api.service';

@View
@Component({
	components: {
		AppLoading,
	},
})
export class AppAuthJoinForm extends BaseForm<any> implements FormOnSubmit {
	@Prop(Boolean) darkVariant?: boolean;

	warnOnDiscard = false;

	readonly Connection = Connection;

	onSubmit() {
		return Api.sendRequest('/web/auth/join', this.formModel);
	}
}
