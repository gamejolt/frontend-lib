import { NgModule } from 'ng-metadata/core';
import { Geo } from './geo.service';

@NgModule({
	providers: [{ provide: 'Geo', useFactory: () => Geo }],
})
export class GeoModule {}
