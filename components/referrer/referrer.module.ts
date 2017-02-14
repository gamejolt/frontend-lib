import { NgModule } from 'ng-metadata/core';
import { makeProvider } from '../../utils/angular-facade';
import { Referrer } from './referrer.service';

@NgModule({
	providers: [
		makeProvider( 'Referrer', Referrer ),
	],
})
export class ReferrerModule { }
