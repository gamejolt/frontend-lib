import { NgModule } from 'ng-metadata/core';
import { Model } from './model.service';

@NgModule({
	providers: [
		{ provide: 'Model', useFactory: () => Model },
	],
})
export class ModelModule { }
