import { NgModule } from 'ng-metadata/core';
import { Payload } from './payload-service';
import { makeProvider } from '../../utils/angular-facade';

@NgModule({
	providers: [
		makeProvider( 'Payload', Payload ),
	],
})
export class PayloadModule { }
