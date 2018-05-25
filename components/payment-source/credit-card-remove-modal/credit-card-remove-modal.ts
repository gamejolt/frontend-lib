import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./credit-card-remove-modal.html';

import { BaseModal } from '../../modal/base';
import { PaymentSource } from '../payment-source.model';
import { AppCreditCard } from '../credit-card';

@View
@Component({
	components: {
		AppCreditCard,
	},
})
export default class AppModalCreditCardRemove extends BaseModal {
	@Prop(String) message: string;
	@Prop(PaymentSource) paymentSource: PaymentSource;
	@Prop(String) title: string;
	@Prop(String) buttonType: 'ok' | 'yes';

	ok() {
		this.modal.resolve(true);
	}

	cancel() {
		this.modal.resolve(false);
	}
}
