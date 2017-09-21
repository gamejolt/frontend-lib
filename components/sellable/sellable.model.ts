import { Model } from '../model/model.service';
import { SellablePricing } from './pricing/pricing.model';
import { LinkedKey } from '../linked-key/linked-key.model';

export class Sellable extends Model {
	static readonly TYPE_FREE = 'free';
	static readonly TYPE_PAID = 'paid';
	static readonly TYPE_PWYW = 'pwyw';

	pricings: SellablePricing[] = [];

	game_package_id?: number;
	type: 'free' | 'paid' | 'pwyw';
	primary: boolean;
	key: string;
	title: string;
	description: string;
	is_owned: boolean;
	linked_keys: LinkedKey[];

	constructor(data: any = {}) {
		super(data);

		if (data.pricings) {
			this.pricings = SellablePricing.populate(data.pricings);
		}

		if (data.linked_keys) {
			this.linked_keys = LinkedKey.populate(data.linked_keys);
		}
	}
}

Model.create(Sellable);
