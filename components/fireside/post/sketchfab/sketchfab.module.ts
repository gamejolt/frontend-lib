import { NgModule } from 'ng-metadata/core';
import { FiresidePostSketchfab } from './sketchfab-model';

@NgModule({
	providers: [
		{ provide: 'FiresidePostSketchfab', useFactory: () => FiresidePostSketchfab },
	],
})
export class FiresidePostSketchfabModule { }
