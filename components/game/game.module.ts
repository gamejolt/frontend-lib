import { NgModule } from 'ng-metadata/core';
import { Game } from './game.model';

@NgModule({
	providers: [{ provide: 'Game', useFactory: () => Game }],
})
export class GameModule {}
