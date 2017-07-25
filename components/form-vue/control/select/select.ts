import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./select.html';

import { BaseFormControl } from '../base';

@View
@Component({})
export class AppFormControlSelect extends BaseFormControl {
	@Prop(Array) validateOn: string[];
	@Prop(Number) validateDelay: number;

	value = '';

	get validationRules() {
		return {
			...this.baseRules,
		};
	}

	onChange(value: string) {
		this.applyValue(value);
	}
}
