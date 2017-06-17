import { NgModule } from 'ng-metadata/core';
import { OrderPayment } from './payment.model';

@NgModule({
	providers: [{ provide: 'Order_Payment', useFactory: () => OrderPayment }],
})
export class OrderPaymentModule {}
