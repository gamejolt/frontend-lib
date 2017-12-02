import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./toggle.html?style=./toggle.styl';

import { BaseFormControl } from '../base';

@View
@Component({})
export class AppFormControlToggle extends BaseFormControl {
	@Prop(Boolean) disabled?: boolean;

	controlVal = false;

	toggle() {
		if (this.disabled) {
			return;
		}

		this.applyValue(!this.controlVal);
	}
}
