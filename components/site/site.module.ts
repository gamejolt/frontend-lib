import { NgModule } from 'ng-metadata/core';
import { Site } from './site-model';

@NgModule({
	providers: [
		{ provide: 'Site', useFactory: () => Site },
	],
})
export class SiteModule { }
