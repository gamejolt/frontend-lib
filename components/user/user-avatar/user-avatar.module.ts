import { NgModule } from 'ng-metadata/core';
import { makeComponentProvider } from '../../../vue/angular-link';
import { AppUserAvatar } from './user-avatar';

@NgModule({
	declarations: [makeComponentProvider(AppUserAvatar)],
})
export class UserAvatarModule {}
