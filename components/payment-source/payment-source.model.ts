import { Model } from '../model/model.service';
import { Api } from '../api/api.service';

export class PaymentSource extends Model {
	last4: string;
	brand: string;
	exp_month: number;
	exp_year: number;
	created_on: number;

	$remove() {
		return this.$_remove('/web/dash/payment-methods/remove/' + this.id);
	}
}

Model.create(PaymentSource);
