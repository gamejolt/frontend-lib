import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./control.html';

import { AppForm } from '../form';
import { AppFormGroup } from '../group/group';
import { findVueParent } from '../../../utils/vue';

@View
@Component({})
export class BaseFormControl extends Vue {
	@Prop() rules: any;

	value: any;

	/**
	 * Whether or not the form control has multiple controls for the group. This
	 * is for radio and checkboxes mostly.
	 */
	multi = false;

	form: AppForm;
	group: AppFormGroup;

	get id() {
		const id = this.form.name + '-' + this.group.name;
		return !this.multi ? id : undefined;
	}

	protected get baseRules() {
		return {
			required: !this.group.optional,
			...this.rules,
		};
	}

	get validationRules() {
		return this.baseRules;
	}

	created() {
		this.form = findVueParent(this, AppForm) as AppForm;
		this.form.controls.push(this);

		this.group = findVueParent(this, AppFormGroup) as AppFormGroup;
		this.group.inputErrors = this.$validator.errorBag;
		this.group.control = this;

		if (!this.multi) {
			// Copy over the initial form model value.
			this.value = this.form.base.formModel[this.group.name];

			// Watch the form model for changes and sync to our control.
			this.$watch(() => this.form.base.formModel[this.group.name], newVal => (this.value = newVal));
		}
	}

	destroyed() {
		if (this.form) {
			const index = this.form.controls.findIndex(control => control === this);
			this.form.controls.splice(index, 1);
		}
	}

	applyValue(value: any) {
		// When the DOM value changes we bind it back to our own value and set
		// it on the form model as well.
		if (!this.multi) {
			this.value = value;
		}

		this.form.base.setField(this.group.name, value);

		this.$emit('changed', value);
		this.form.onChange();
	}
}
