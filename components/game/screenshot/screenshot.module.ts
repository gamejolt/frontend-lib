import { NgModule } from 'ng-metadata/core';
import { GameScreenshot } from './screenshot.model';

@NgModule({
	providers: [
		{ provide: 'Game_Screenshot', useFactory: () => GameScreenshot }
	],
})
export class GameScreenshotModule { }
