import { NgModule } from 'ng-metadata/core';
import { Payload } from './payload-service';

@NgModule({
	providers: [
		{ provide: 'Payload', useFactory: () => Payload },
	],
})
export class PayloadModule { }
