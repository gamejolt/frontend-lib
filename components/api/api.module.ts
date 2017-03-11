import { NgModule } from 'ng-metadata/core';
import { Api } from './api.service';

@NgModule({
	providers: [
		{ provide: 'Api', useFactory: () => Api },
	],
})
export class ApiModule { }
