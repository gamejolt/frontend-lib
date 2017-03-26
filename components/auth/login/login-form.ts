import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./login-form.html';

import { Connection } from '../../connection/connection-service';
import { makeObservableService } from '../../../utils/vue';
import { FormCommonComponents } from '../../form-vue/form';
import { BaseForm, FormOnSubmit } from '../../form-vue/form.service';
import { AppLoading } from '../../../vue/components/loading/loading';
import { Api } from '../../api/api.service';

@View
@Component({
	name: 'auth-login-form',
	components: {
		AppLoading,
		...FormCommonComponents,
	},
})
export class AppAuthLoginForm extends BaseForm implements FormOnSubmit
{
	@Prop( Boolean ) darkVariant?: boolean;

	Connection = makeObservableService( Connection );

	changed()
	{
		this.resetErrors();
	}

	resetErrors()
	{
		this.setState( 'invalidLogin', false );
		this.setState( 'blockedLogin', false );
	}

	async onSubmit()
	{
		this.resetErrors();

		const response = await Api.sendRequest( '/web/auth/login', this.formModel );

		if ( response.success === false ) {
			if ( response.reason ) {
				if ( response.reason === 'invalid-login' ) {
					this.setState( 'invalidLogin', true );
				}
				else if ( response.reason === 'blocked' ) {
					this.setState( 'blockedLogin', true );
				}
			}
		}

		return response;
	}
}
