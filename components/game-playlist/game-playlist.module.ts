import { NgModule } from 'ng-metadata/core';
import { GamePlaylist } from './game-playlist.model';

@NgModule({
	providers: [
		{ provide: 'GamePlaylist', useFactory: () => GamePlaylist },
	],
})
export class GamePlaylistModule { }
