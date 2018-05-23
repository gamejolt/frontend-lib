import Vue from 'vue';
import View from '!view!./credit-card.html?style=./credit-card.styl';
import { Component, Prop } from 'vue-property-decorator';

import { AppJolticon } from '../../vue/components/jolticon/jolticon';
import { PaymentSource } from './payment-source.model';

@View
@Component({
	components: { AppJolticon },
})
export class AppCreditCard extends Vue {
	@Prop(PaymentSource) paymentSource: PaymentSource;
	@Prop(Boolean) preview: boolean;

	get brandName() {
		return this.paymentSource.brand;
	}

	get last4() {
		return this.paymentSource.last4;
	}

	get expires() {
		return this.paymentSource.exp_month + '/' + this.paymentSource.exp_year;
	}

	get mainDivClass() {
		return this.preview ? '' : 'col-md-6';
	}

	onRemove(e: Event) {
		this.$emit('remove', e, this.paymentSource.id);
	}
}
