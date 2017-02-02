import { NgModule } from 'ng-metadata/core';
import { CommentVote } from './vote-model';

@NgModule({
	providers: [
		{ provide: 'Comment_Vote', useFactory: () => CommentVote },
	],
})
export class CommentVoteModule { }
