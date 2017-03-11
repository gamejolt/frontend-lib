import { NgModule } from 'ng-metadata/core';
import { Clipboard } from './clipboard-service';

@NgModule({
	providers: [
		{ provide: 'Clipboard', useFactory: () => Clipboard },
	],
})
export class ClipboardModule { }
