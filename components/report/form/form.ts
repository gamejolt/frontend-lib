import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./form.html';

import { FormOnSubmit, BaseForm } from '../../form-vue/form.service';
import { FormCommonComponents } from '../../form-vue/form';
import { Api } from '../../api/api.service';

@View
@Component({
	components: {
		...FormCommonComponents,
	},
})
export class AppReportForm extends BaseForm implements FormOnSubmit
{
	@Prop( String ) type: string;
	@Prop( Object ) resource: any;

	onSubmit()
	{
		const data = {
			resourceName: this.type,
			resourceId: this.resource.id,
			reason: this.formModel.reason,
		};

		return Api.sendRequest( '/web/report/submit', data );
	}
}
