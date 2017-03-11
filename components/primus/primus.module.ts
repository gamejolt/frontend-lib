import { NgModule } from 'ng-metadata/core';
import { Primus } from './primus.service';

@NgModule({
	providers: [
		{ provide: 'Primus', useFactory: () => Primus },
	],
})
export class PrimusModule { }
