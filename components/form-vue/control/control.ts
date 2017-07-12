import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./control.html';

import { BaseFormControl } from './base';

import { createTextMaskInputElement } from 'text-mask-core/dist/textMaskCore';

@View
@Component({})
export class AppFormControl extends BaseFormControl {
	@Prop({ type: String, default: 'text' })
	type: string;

	@Prop(Array) validateOn: string[];

	@Prop(Number) validateDelay: number;

	@Prop(Array) mask: (string | RegExp)[];

	value = '';
	maskedInputElem: any = null;

	$el: HTMLInputElement;

	get validationRules() {
		return {
			...this.baseRules,
			email: this.type === 'email',
		};
	}

	mounted() {
		if (this.mask) {
			this.maskedInputElem = createTextMaskInputElement({
				inputElement: this.$el,
				mask: this.mask,
			});
			this.maskedInputElem.update(this.value);
		}
	}

	onChange() {
		if (this.mask) {
			this.maskedInputElem.update(this.$el.value);
		}

		this.applyValue(this.$el.value);
	}
}
