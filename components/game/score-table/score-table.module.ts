import { NgModule } from 'ng-metadata/core';
import { GameScoreTable } from './score-table.model';

@NgModule({
	providers: [
		{ provide: 'Game_ScoreTable', useFactory: () => GameScoreTable },
	],
})
export class GameScoreTableModule { }
