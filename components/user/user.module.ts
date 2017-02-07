import { NgModule } from 'ng-metadata/core';
import { User } from './user.model';

@NgModule({
	providers: [
		{ provide: 'User', useFactory: () => User }
	],
})
export class UserModule { }
