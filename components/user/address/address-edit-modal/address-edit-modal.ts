import View from '!view!./address-edit-modal.html';
import { Component, Prop } from 'vue-property-decorator';

import { BaseModal } from '../../../modal/base';
import { Address } from '../address.model';
import { FormUserAddress } from '../address-form/address-form';

@View
@Component({
	components: {
		FormUserAddress,
	},
})
export default class AppUserAddressEditModal extends BaseModal {
	@Prop(Address) address: Address;

	onSaved() {
		console.log('saved');
	}
}
