import { Model } from '../model/model.service';
import { Api } from '../api/api.service';

export class PaymentSource extends Model {
	last4: string;
	brand: string;
	exp_month: number;
	exp_year: number;
	created_on: number;

	async $remove() {
		const response = await Api.sendRequest(
			'/web/dash/payment-methods/remove/' + this.id,
			{},
			{ detach: true }
		);

		return response;
	}
}

Model.create(PaymentSource);
