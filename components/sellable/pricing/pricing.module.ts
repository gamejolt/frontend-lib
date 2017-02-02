import { NgModule } from 'ng-metadata/core';
import { SellablePricing } from './pricing.model';

@NgModule({
	providers: [
		{ provide: 'Sellable_Pricing', useFactory: () => SellablePricing }
	],
})
export class SellablePricingModule { }
