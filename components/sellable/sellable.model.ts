import { Model } from '../model/model.service';
import { SellablePricing } from './pricing/pricing.model';

export class Sellable extends Model
{
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

	constructor( data: any = {} )
	{
		super( data );

		if ( data.pricings ) {
			this.pricings = SellablePricing.populate( data.pricings );
		}
	}
}

Model.create( Sellable );
