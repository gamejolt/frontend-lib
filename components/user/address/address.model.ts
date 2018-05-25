import { Model } from '../../model/model.service';
import { Api } from '../../api/api.service';

export class Address extends Model {
	static readonly TYPE_BILLING = 'billing';
	static readonly TYPE_SHIPPING = 'shipping';

	user_id: number;
	type: 'billing' | 'shipping';
	fullname: string;
	street1: string;
	street2: string;
	city: string;
	region: string;
	postcode: string;
	country: string;

	async $remove() {
		const response = await Api.sendRequest(
			'/web/dash/billing-address/remove/' + this.id,
			{},
			{ detach: true }
		);

		return response;
	}

	async $save() {
		console.log('this');
	}
}

Model.create(Address);
