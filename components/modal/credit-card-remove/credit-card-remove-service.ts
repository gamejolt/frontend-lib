import { Modal } from '../modal.service';
import { asyncComponentLoader } from '../../../utils/utils';
import { PaymentSource } from '../../payment-source/payment-source.model';

export class ModalCreditCardRemove {
	static async show(
		message: string,
		paymentSource: PaymentSource,
		title = 'Confirm...',
		buttonType: 'ok' | 'yes' = 'ok'
	) {
		return await Modal.show<boolean>({
			size: 'sm',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "ModalCreditCardRemove" */ './credit-card-remove')
				),
			props: { message, paymentSource, title, buttonType },
		});
	}
}
