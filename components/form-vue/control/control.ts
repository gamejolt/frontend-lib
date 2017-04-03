import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./control.html';

import { AppForm } from '../form';
import { AppFormGroup } from '../group/group';
import { findVueParent } from '../../../utils/vue';

@View
@Component({})
export class AppFormControl extends Vue
{
	@Prop( { type: String, default: 'text' } ) type: string;
	@Prop() rules: any;
	@Prop( Array ) validateOn: string[];
	@Prop( Number ) validateDelay: number;

	value: string = '';
	addControlClass = true;

	/**
	 * Whether or not we should add an ID to this control. We don't add to
	 * inputs that will be repeated for the same model.
	 */
	addId = true;

	form: AppForm;
	group: AppFormGroup;

	get id()
	{
		const id = this.form.name + '-' + this.group.name;
		return this.addId ? id : undefined;
	}

	get _rules()
	{
		return {
			required: !this.group.optional,
			email: this.type === 'email',
			...this.rules,
		};
	}

	created()
	{
		this.form = findVueParent( this, AppForm ) as AppForm;
		this.form.controls.push( this );

		this.group = findVueParent( this, AppFormGroup ) as AppFormGroup;
		this.group.inputErrors = this.$validator.errorBag;
		this.group.control = this;

		// These elements don't get the form-control class.
		if ( [ 'radio', 'checkbox', 'file', 'upload', 'crop' ].indexOf( this.type ) !== -1 ) {
			this.addControlClass = false;
		}

		if ( [ 'radio', 'checkbox' ].indexOf( this.type ) !== -1 ) {
			this.addId = false;
		}

		// Copy over the initial form model value.
		this.value = this.form.base.formModel[ this.group.name ];
	}

	destroyed()
	{
		if ( this.form ) {
			const index = this.form.controls.findIndex( ( control ) => control === this );
			this.form.controls.splice( index, 1 );
		}
	}

	onChange( value: any )
	{
		// When the DOM value changes we bind it back to our own value and set
		// it on the form model as well.
		this.value = value;
		Vue.set( this.form.base.formModel, this.group.name, value );

		this.$emit( 'changed', value );
	}
}
