import { Modal } from '../../../modal/modal.service';
import { Address } from '../address.model';
import { asyncComponentLoader } from '../../../../utils/utils';

interface UserAddressEditModalOptions {
	address: Address;
}

export class UserAddressEditModal {
	static async show(options: UserAddressEditModalOptions) {
		return await Modal.show<void>({
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "UserAddressEditModal" */ './address-edit-modal')
				),
			size: 'sm',
			props: options,
			noBackdropClose: true,
		});
	}
}
