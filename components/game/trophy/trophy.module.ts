import { NgModule } from 'ng-metadata/core';
import { GameTrophy } from './trophy.model';

@NgModule({
	providers: [{ provide: 'Game_Trophy', useFactory: () => GameTrophy }],
})
export class GameTrophyModule {}
