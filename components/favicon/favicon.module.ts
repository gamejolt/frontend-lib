import { NgModule } from 'ng-metadata/core';
import { makeProvider } from '../../utils/angular-facade';
import { Favicon } from './favicon.service';

@NgModule({
	providers: [
		makeProvider( 'Favicon', Favicon ),
	],
})
export class FaviconModule { }
