import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./date.html';

import { BaseFormControl } from '../base';
import { AppDatetimePicker } from '../../../datetime-picker/datetime-picker';

@View
@Component({
	components: {
		AppDatetimePicker,
	},
})
export class AppFormControlDate extends BaseFormControl {
	@Prop(Number) timezoneOffset: number;

	value = Date.now();

	get minDate() {
		return this.validationRules.min_date;
	}

	get maxDate() {
		return this.validationRules.max_date;
	}

	onChange(value: number) {
		this.applyValue(value);
	}
}
