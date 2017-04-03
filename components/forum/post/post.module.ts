import { NgModule } from 'ng-metadata/core';
import { ForumPost } from './post.model';

@NgModule({
	providers: [
		{ provide: 'Forum_Post', useFactory: () => ForumPost },
	],
})
export class ForumPostModule { }
