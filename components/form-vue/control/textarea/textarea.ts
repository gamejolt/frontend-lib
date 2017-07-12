import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./textarea.html';

import { BaseFormControl } from '../base';

@View
@Component({})
export class AppFormControlTextarea extends BaseFormControl {
	@Prop(Array) validateOn: string[];
	@Prop(Number) validateDelay: number;

	value: string = '';

	get validationRules() {
		return {
			...this.baseRules,
		};
	}

	onChange(value: string) {
		this.applyValue(value);
	}
}
