import { NgModule } from 'ng-metadata/core';
import { Meta } from './meta-service';

@NgModule({
	providers: [
		{ provide: 'Meta', useFactory: () => Meta },
	],
})
export class MetaModule { }
