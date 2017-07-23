import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./control.html';

import { BaseFormControl } from './base';

import { createTextMaskInputElement } from 'text-mask-core/dist/textMaskCore';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';

const currencyFormatter = new Intl.NumberFormat(undefined, {
	style: 'decimal',
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
	useGrouping: false,
});

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

	get controlType() {
		if (this.type === 'currency') {
			return 'text';
		}
		return this.type;
	}

	get validationRules() {
		return {
			...this.baseRules,
			email: this.type === 'email',
		};
	}

	get _mask() {
		let mask = this.mask;
		if (this.type === 'currency') {
			mask = createNumberMask({
				prefix: '',
				includeThousandsSeparator: false,
				allowDecimal: true,
			});
		}

		return mask;
	}

	mounted() {
		const mask = this._mask;
		if (mask) {
			this.maskedInputElem = createTextMaskInputElement({
				inputElement: this.$el,
				mask,
			});
			this.maskedInputElem.update(this.formatValue(this.value));
		}
	}

	private formatValue(value: string) {
		if (this.type === 'currency') {
			if (!value) {
				return '0.00';
			}
			return currencyFormatter.format(parseFloat(value));
		}

		return value;
	}

	onChange() {
		if (this.maskedInputElem) {
			this.maskedInputElem.update(this.formatValue(this.$el.value));
		}

		this.applyValue(this.formatValue(this.$el.value));
	}
}
