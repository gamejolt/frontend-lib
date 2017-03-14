import { NgModule } from 'ng-metadata/core';
import { Growls } from './growls.service';

import { makeComponentProvider } from '../../vue/angular-link';
import { AppGrowls } from './growls';

@NgModule({
	declarations: [
		makeComponentProvider( AppGrowls ),
	],
	providers: [
		{ provide: 'Growls', useFactory: () => Growls },
	],
})
export class GrowlsModule { }
