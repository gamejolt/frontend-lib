import { NgModule } from 'ng-metadata/core';
import { SiteContentBlock } from './content-block-model';

@NgModule({
	providers: [
		{ provide: 'SiteContentBlock', useFactory: () => SiteContentBlock },
	],
})
export class SiteContentBlockModule { }
