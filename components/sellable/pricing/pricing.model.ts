import { Injectable } from '@angular/core';
import { makeModel, Model } from '../../model/model.service';

@Injectable()
export class SellablePricing extends Model
{
	amount: number;
	currency_code: string;
	country_code: string;
	promotional: boolean;
	start: number;
	end: number;
	timezone: string;

	constructor( data?: any )
	{
		super( data );
	}

	static getOriginalPricing( pricings: SellablePricing[] )
	{
		if ( Array.isArray( pricings ) ) {
			if ( pricings[0].promotional ) {
				return pricings[1];
			}
			return pricings[0];
		}
		return undefined;
	}

	static getPromotionalPricing( pricings: SellablePricing[] )
	{
		if ( Array.isArray( pricings ) && pricings[0].promotional ) {
			return pricings[0];
		}
		return undefined;
	}
}

const deps = {};
export const provideSellablePricing = makeModel( SellablePricing, deps );
