import { NgModule } from 'ng-metadata/core';
import { Growls } from './growls.service';

@NgModule({
	providers: [
		{ provide: 'Growls', useFactory: () => Growls },
	],
})
export class GrowlsModule { }
