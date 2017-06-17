import { NgModule } from 'ng-metadata/core';
import { Subscription } from './subscription.model';

@NgModule({
	imports: [],
	exports: [],
	declarations: [],
	providers: [{ provide: 'Subscription', useFactory: () => Subscription }],
})
export class SubscriptionModule {}
