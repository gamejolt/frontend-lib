import { NgModule } from 'ng-metadata/core';
import { Comment } from './comment-model';

@NgModule({
	providers: [
		{ provide: 'Comment', useFactory: () => Comment }
	],
})
export class CommentModule { }
