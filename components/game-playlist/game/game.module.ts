import { NgModule } from 'ng-metadata/core';
import { GamePlaylistGame } from './game.model';

@NgModule({
	providers: [
		{ provide: 'GamePlaylist_Game', useFactory: () => GamePlaylistGame },
	],
})
export class GamePlaylistGameModule { }
