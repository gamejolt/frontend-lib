import { NgModule } from 'ng-metadata/core';
import { GameRelease } from './release.model';

@NgModule({
	providers: [
		{ provide: 'Game_Release', useFactory: () => GameRelease }
	],
})
export class GameReleaseModule { }
