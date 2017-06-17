import { NgModule } from 'ng-metadata/core';
import { OrderAddress } from './address.model';

@NgModule({
	providers: [{ provide: 'Order_Address', useFactory: () => OrderAddress }],
})
export class OrderAddressModule {}
