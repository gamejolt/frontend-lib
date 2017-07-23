import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./form.html';

import { FormOnSubmit, BaseForm } from '../../form-vue/form.service';
import { Api } from '../../api/api.service';

@View
@Component({})
export class AppReportForm extends BaseForm<any> implements FormOnSubmit {
	@Prop(String) type: string;
	@Prop(Object) resource: any;

	warnOnDiscard = false;

	onSubmit() {
		const data = {
			resourceName: this.type,
			resourceId: this.resource.id,
			reason: this.formModel.reason,
		};

		return Api.sendRequest('/web/report/submit', data);
	}
}
