import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./form.html';
import * as VeeValidate from 'vee-validate';

import { AppFormControl } from './control/control';
import { AppFormGroup } from './group/group';
import { findVueParent } from '../../utils/vue';
import { BaseForm } from './form.service';
import { AppFormControlErrors } from './control-errors/control-errors';
import { AppFormControlError } from './control-errors/control-error';
import { AppFormButton } from './button/button';
import { FormValidatorPattern } from './validators/pattern';
import { FormValidatorAvailability } from './validators/availability';

Vue.use( VeeValidate );

@View
@Component({
	name: 'form',
})
export class AppForm extends Vue
{
	@Prop( String ) name: string;

	base: BaseForm;
	controls: AppFormControl[] = [];

	private static hasAddedValidators = false;

	mounted()
	{
		if ( !AppForm.hasAddedValidators ) {
			this.$validator.extend( 'pattern', FormValidatorPattern );
			this.$validator.extend( 'availability', FormValidatorAvailability );
			AppForm.hasAddedValidators = true;
		}
	}

	created()
	{
		this.base = findVueParent( this, BaseForm ) as BaseForm;
		if ( !this.base ) {
			throw new Error( `Couldn't find BaseForm in parent tree.` );
		}
	}

	async validate()
	{
		const promises = this.controls.map( async ( control ) =>
		{
			// vee-validate throws an error for failed validation
			try {
				await control.$validator.validateAll();
			}
			catch ( _e ) {}
		} );

		await Promise.all( promises );
	}

	get hasErrors()
	{
		let hasErrors = false;

		this.controls.forEach( ( control ) =>
		{
			if ( control.$validator.getErrors().count() > 0 ) {
				hasErrors = true;
			}
		} );

		return hasErrors;
	}

	async onSubmit()
	{
		// Gotta validate all controls first.
		await this.validate();

		// If we have validation errors, don't let it pass through.
		if ( this.hasErrors ) {
			return;
		}

		this.base._onSubmit();
	}
}

export const FormCommonComponents = {
	AppForm,
	AppFormControl,
	AppFormGroup,
	AppFormControlErrors,
	AppFormControlError,
	AppFormButton,
};