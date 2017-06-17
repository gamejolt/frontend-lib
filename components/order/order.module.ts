import { NgModule } from 'ng-metadata/core';
import { Order } from './order.model';

@NgModule({
	providers: [{ provide: 'Order', useFactory: () => Order }],
})
export class OrderModule {}
