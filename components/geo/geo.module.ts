import { NgModule } from 'ng-metadata/core';
import { makeProvider } from '../../utils/angular-facade';
import { Geo } from './geo.service';

@NgModule({
	providers: [
		makeProvider( 'Geo', Geo ),
	],
})
export class GeoModule { }
