import { NgModule } from 'ng-metadata/core';
import { Referrer } from './referrer.service';

@NgModule({
	providers: [
		{ provide: 'Referrer', useFactory: () => Referrer },
	],
})
export class ReferrerModule { }
