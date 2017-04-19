import { NgModule } from 'ng-metadata/core';
import { UserGameSession } from './session.model';

@NgModule({
	providers: [
		{ provide: 'User_GameSession', useFactory: () => UserGameSession }
	],
})
export class UserGameSessionModule { }
