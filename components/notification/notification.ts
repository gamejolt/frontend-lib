import { NotificationFactory } from './notification-model';

export default angular.module( 'gj.Notification', [
	'gj.Model',
] )
.factory( 'Notification', NotificationFactory )
.name;
