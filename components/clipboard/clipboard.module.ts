import { NgModule } from 'ng-metadata/core';
import { makeProvider } from '../../utils/angular-facade';
import { Clipboard } from './clipboard-service';

@NgModule({
	providers: [
		makeProvider( 'Clipboard', Clipboard ),
	],
})
export class ClipboardModule { }
