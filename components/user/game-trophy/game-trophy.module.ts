import { NgModule } from 'ng-metadata/core';
import { UserGameTrophy } from './game-trophy.model';

@NgModule({
	providers: [
		{ provide: 'User_GameTrophy', useFactory: () => UserGameTrophy }
	],
})
export class UserGameTrophyModule { }
