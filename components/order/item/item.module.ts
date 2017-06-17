import { NgModule } from 'ng-metadata/core';
import { OrderItem } from './item.model';

@NgModule({
	providers: [{ provide: 'Order_Item', useFactory: () => OrderItem }],
})
export class OrderItemModule {}
