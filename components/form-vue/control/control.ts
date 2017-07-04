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

	get validationRules() {
		return {
			...this.baseRules,
			email: this.type === 'email',
		};
	}

	onChange(value: string) {
		this.applyValue(value);
	}
}
