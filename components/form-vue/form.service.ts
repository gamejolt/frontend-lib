import Vue from 'vue';
import { Prop, Component } from 'vue-property-decorator';

import { AppForm } from './form';
import { AppFormControl } from './control/control';
import { AppFormGroup } from './group/group';
import { AppFormControlErrors } from './control-errors/control-errors';
import { AppFormControlError } from './control-errors/control-error';
import { AppFormButton } from './button/button';

export interface FormOnSubmit
{
	onSubmit(): Promise<any>;
}

export interface FormOnSubmitSuccess
{
	onSubmitSuccess( response: any ): void;
}

@Component({
	components: {
		AppForm,
		AppFormControl,
		AppFormGroup,
		AppFormControlErrors,
		AppFormControlError,
		AppFormButton,
	},
})
export class BaseForm<T> extends Vue
{
	@Prop( Object ) model?: T;

	formModel: T = {} as T;
	modelClass?: { new( data?: T ): T } = undefined;
	resetOnSubmit = false;
	saveMethod?: keyof T;
	method: 'add' | 'edit' = 'add';
	changed = false;

	state: { [k: string]: any } = {
		isProcessing: false,
		isShowingSuccess: false,
		// isShowingSuccess: isShowingSuccess,
		serverErrors: {},
		// progress: undefined,
	};

	created()
	{
		this.changed = false;

		// Is a base model defined? If so, then we're editing.
		if ( this.model ) {
			this.method = 'edit';

			// If a model class was assigned to this form, then create a copy of
			// it on the instance. Otherwise just copy the object.
			if ( this.modelClass ) {
				this.formModel = new this.modelClass( this.model );
			}
			else {
				this.formModel = Object.assign( {}, this.model );
			}
		}
		else {

			// If we have a model class, then create a new one.
			if ( this.modelClass ) {
				this.formModel = new this.modelClass();
			}
			// Otherwise, just use an empty object as the form's model.
			else {
				this.formModel = {} as T;
			}
		}
	}

	setState( key: string, value: any )
	{
		Vue.set( this.state, key, value );
	}

	async _onSubmit()
	{
		if ( this.state.isProcessing ) {
			return;
		}

		this.state.isProcessing = true;
		// this.state.progress = undefined;

		let response: any;

		try {
			if ( (this as any).onSubmit ) {
				const _response = await (this as any).onSubmit();
				if ( _response.success === false ) {
					throw _response;
				}

				response = _response;
			}
			else if ( this.modelClass ) {
				response = await (this.formModel as any)[ this.saveMethod || '$save' ]();

				// Copy it back to the base model.
				if ( this.model ) {
					Object.assign( this.model, this.formModel );
				}
			}

			if ( (this as any).onSubmitSuccess ) {
				(this as any).onSubmitSuccess( response );
			}

			// Send the new model back into the submit handler.
			this.$emit( 'submit', this.formModel, response );
			// if ( angular.isDefined( scope.submitHandler ) ) {
			// scope.submitHandler( { formModel: scope.formModel, $response: response } );
			// }

			// Reset our processing state.
			this.state.isProcessing = false;

			// Make sure that serverErrors is reset on a successful submit, just in case.
			this.state.serverErrors = {};

			// After successful submit of the form, we broadcast the onSubmitted event.
			// We will capture this in the gjForm directive to set the form to a pristine state.
			// scope.$broadcast( 'gjForm.onSubmitted', {} );

			// Show successful form submission.
			// _this._showSuccess( scope );

			// TODO: Test this!
			// If we should reset on successful submit, let's do that now.
			if ( this.resetOnSubmit ) {
				this.created();
			}
		}
		catch ( _response ) {

			console.error( 'Form error', _response );

			// Store the server validation errors.
			if ( _response && _response.errors ) {
				Vue.set( this.state, 'serverErrors', _response.errors );
			}

			// Reset our processing state.
			this.state.isProcessing = false;
		}
	}
}
