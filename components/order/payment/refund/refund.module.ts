import { NgModule } from 'ng-metadata/core';
import { OrderPaymentRefund } from './refund.model';

@NgModule({
	providers: [
		{ provide: 'Order_Payment_Refund', useFactory: () => OrderPaymentRefund }
	],
})
export class OrderPaymentRefundModule { }
