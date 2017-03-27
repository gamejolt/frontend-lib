import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./join-form.html';

import { Connection } from '../../connection/connection-service';
import { makeObservableService } from '../../../utils/vue';
import { FormOnSubmit, BaseForm } from '../../form-vue/form.service';
import { AppLoading } from '../../../vue/components/loading/loading';
import { FormCommonComponents } from '../../form-vue/form';
import { Api } from '../../api/api.service';

@View
@Component({
	name: 'auth-join-form',
	components: {
		AppLoading,
		...FormCommonComponents,
	},
})
export class AppAuthJoinForm extends BaseForm implements FormOnSubmit
{
	@Prop( Boolean ) darkVariant?: boolean;

	Connection = makeObservableService( Connection );

	onSubmit()
	{
		return Api.sendRequest( '/web/auth/join', this.formModel );
	}
}