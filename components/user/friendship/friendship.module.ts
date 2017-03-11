import { NgModule } from 'ng-metadata/core';
import { UserFriendship } from './friendship.model';

@NgModule({
	providers: [
		{ provide: 'User_Friendship', useFactory: () => UserFriendship }
	],
})
export class UserFriendshipModule { }
