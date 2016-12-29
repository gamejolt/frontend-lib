import { Injectable } from '@angular/core';
import { makeModel, Model } from '../model/model.service';
import { SellablePricing } from './pricing/pricing.model';

@Injectable()
export class Sellable extends Model
{
	static SellablePricing: typeof SellablePricing;

	static readonly TYPE_FREE = 'free';
	static readonly TYPE_PAID = 'paid';
	static readonly TYPE_PWYW = 'pwyw';

	pricings: SellablePricing[];

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

const deps = { SellablePricing };
export const provideSellable = makeModel( Sellable, deps );
