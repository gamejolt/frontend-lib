import { NgModule } from 'ng-metadata/core';
import { Sellable } from './sellable.model';

@NgModule({
	providers: [
		{ provide: 'Sellable', useFactory: () => Sellable }
	],
})
export class SellableModule { }
