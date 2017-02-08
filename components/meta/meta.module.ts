import { NgModule } from 'ng-metadata/core';
import { makeProvider } from '../../utils/angular-facade';
import { Meta } from './meta-service';

@NgModule({
	providers: [
		makeProvider( 'Meta', Meta ),
	],
})
export class MetaModule { }
