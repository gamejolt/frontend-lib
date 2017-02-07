import { NgModule } from 'ng-metadata/core';
import { GameSketchfab } from './sketchfab.model';

@NgModule({
	providers: [
		{ provide: 'GameSketchfab', useFactory: () => GameSketchfab },
	],
})
export class GameSketchfabModule { }
