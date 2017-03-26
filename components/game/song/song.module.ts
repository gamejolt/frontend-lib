import { NgModule } from 'ng-metadata/core';
import { GameSong } from './song.model';

@NgModule({
	providers: [
		{ provide: 'Game_Song', useFactory: () => GameSong },
	],
})
export class GameSongModule { }
