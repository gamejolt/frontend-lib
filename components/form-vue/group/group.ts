import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./group.html';

import { AppForm } from '../form';
import { findVueParent } from '../../../utils/vue';
import { titleCase } from '../../../utils/string';
import { ErrorBag } from 'vee-validate';
import { BaseFormControl } from '../control/base';

@View
@Component({})
export class AppFormGroup extends Vue {
	@Prop(String) name: string;
	@Prop(String) label?: string;
	@Prop(Boolean) optional?: boolean;
	@Prop(Boolean) hideLabel?: boolean;
	@Prop(String) labelClass?: string;

	form: AppForm;
	control: BaseFormControl;
	inputErrors: ErrorBag | null = null;

	get humanLabel() {
		const name = this.name;

		if (!this.label) {
			return titleCase(name);
		}

		return this.label;
	}

	get labelClasses() {
		let labelClass = this.labelClass || '';

		if (this.hideLabel) {
			labelClass += ' sr-only';
		}

		return labelClass;
	}

	created() {
		this.form = findVueParent(this, AppForm) as AppForm;
	}
}
