import { NgModule } from 'ng-metadata/core';
import { Api } from './api.service';
import { makeProvider } from '../../utils/angular-facade';

@NgModule({
	providers: [
		makeProvider( 'Api', Api ),
	],
})
export class ApiModule { }
