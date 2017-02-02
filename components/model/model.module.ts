import { NgModule } from 'ng-metadata/core';
import { Model } from './model.service';
import { makeProvider } from '../../utils/angular-facade';

@NgModule({
	providers: [
		makeProvider( 'Model', Model ),
	],
})
export class ModelModule { }
