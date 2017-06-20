import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./toggle.html?style=./toggle.styl';

import { BaseFormControl } from '../base';

@View
@Component({})
export class AppFormControlToggle extends BaseFormControl {
	@Prop(Boolean) disabled?: boolean;

	value: boolean = false;

	toggle() {
		if (this.disabled) {
			return;
		}

		this.applyValue(!this.value);
	}
}
