import { NgModule } from 'ng-metadata/core';
import { ForumChannel } from './channel.model';

@NgModule({
	providers: [
		{ provide: 'Forum_Channel', useFactory: () => ForumChannel },
	],
})
export class ForumChannelModule { }
