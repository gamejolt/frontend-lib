import { NgModule } from 'ng-metadata/core';
import { GameLibraryGame } from './game.model';

@NgModule({
	providers: [{ provide: 'GameLibrary_Game', useFactory: () => GameLibraryGame }],
})
export class GameLibraryGameModule {}
