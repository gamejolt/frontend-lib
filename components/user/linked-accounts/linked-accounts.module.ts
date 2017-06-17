import { NgModule } from 'ng-metadata/core';
import { UserLinkedAccounts } from './linked-accounts.service';

@NgModule({
	providers: [
		{ provide: 'UserLinkedAccounts', useFactory: () => UserLinkedAccounts },
	],
})
export class UserLinkedAccountsModule {}
