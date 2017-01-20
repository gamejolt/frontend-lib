import { Model } from '../services/model/model';
import { SellablePricing } from './sellable/pricing';

export class Sellable extends Model
{
	static SellablePricing: typeof SellablePricing;

	static readonly TYPE_FREE = 'free';
	static readonly TYPE_PAID = 'paid';
	static readonly TYPE_PWYW = 'pwyw';

	pricings: SellablePricing[];

	game_package_id?: number;
	type: 'free' | 'paid' | 'pwyw';
	primary: boolean;
	key: string;
	title: string;
	description: string;
	is_owned: boolean;

	constructor( data?: any )
	{
		super( data );

		if ( data.pricings ) {
			this.pricings = Sellable.SellablePricing.populate( data.pricings );
		}
	}
}
