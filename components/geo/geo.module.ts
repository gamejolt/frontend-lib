import { NgModule } from 'ng-metadata/core';
import { Geo } from './geo.service';

@NgModule({
	providers: [
		Geo,
	],
})
export class GeoModule { }
