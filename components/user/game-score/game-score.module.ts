import { NgModule } from 'ng-metadata/core';
import { UserGameScore } from './game-score.model';

@NgModule({
	providers: [{ provide: 'User_GameScore', useFactory: () => UserGameScore }],
})
export class UserGameScoreModule {}
