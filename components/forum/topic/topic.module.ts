import { NgModule } from 'ng-metadata/core';
import { ForumTopic } from './topic.model';

@NgModule({
	providers: [
		{ provide: 'Forum_Topic', useFactory: () => ForumTopic },
	],
})
export class ForumTopicModule { }
