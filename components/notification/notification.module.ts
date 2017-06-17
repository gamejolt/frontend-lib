import { NgModule } from 'ng-metadata/core';
import { Notification } from './notification-model';

@NgModule({
	providers: [{ provide: 'Notification', useFactory: () => Notification }],
})
export class NotificationModule {}
