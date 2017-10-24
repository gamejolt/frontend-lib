import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./radio.html';

import { BaseFormControl } from '../base';

@View
@Component({})
export class AppFormControlRadio extends BaseFormControl {
	@Prop() value: any;

	multi = true;

	get checked() {
		return this.form.base.formModel[this.group.name] === this.value;
	}

	onChange() {
		this.applyValue(this.value);
	}
}
