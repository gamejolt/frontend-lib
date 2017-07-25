import { Modal } from '../modal.service';
import { asyncComponentLoader } from '../../../utils/utils';

export class ModalConfirm {
	static async show(message: string, title = 'Confirm...', buttonType: 'ok' | 'yes' = 'ok') {
		return await Modal.show<boolean>({
			size: 'sm',
			component: () =>
				asyncComponentLoader(import(/* webpackChunkName: "ModalConfirm" */ './confirm')),
			props: { message, title, buttonType },
		});
	}
}
