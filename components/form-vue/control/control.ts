import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./control.html';

import { BaseFormControl } from './base';

@View
@Component({})
export class AppFormControl extends BaseFormControl {
	@Prop({ type: String, default: 'text' })
	type: string;
	@Prop(Array) validateOn: string[];
	@Prop(Number) validateDelay: number;

	value: string = '';
	addControlClass = true;

	get validationRules() {
		return {
			...this.baseRules,
			email: this.type === 'email',
		};
	}

	created() {
		// These elements don't get the form-control class.
		if (
			['radio', 'checkbox', 'file', 'upload', 'crop'].indexOf(this.type) !== -1
		) {
			this.addControlClass = false;
		}

		if (['radio', 'checkbox'].indexOf(this.type) !== -1) {
			this.addId = false;
		}
	}

	onChange(value: string) {
		this.applyValue(value);
	}
}
