import { Modal } from '../../modal/modal.service';
import { asyncComponentLoader } from '../../../utils/utils';
import { LinkedAccount, FacebookPage } from '../linked-account.model';

export class ModalFacebookPageSelector {
	static async show(message: string, account: LinkedAccount, title = 'Confirm...') {
		return await Modal.show<FacebookPage | false>({
			size: 'sm',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "ModalFacebookPageSelector" */ './facebook-page-selector-modal')
				),
			props: { message, account, title },
		});
	}
}
