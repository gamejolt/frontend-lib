import { NgModule } from 'ng-metadata/core';
import { SiteTemplate } from './template-model';

@NgModule({
	providers: [
		{ provide: 'SiteTemplate', useFactory: () => SiteTemplate },
	],
})
export class SiteTemplateModule { }
