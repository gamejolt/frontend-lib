import { NgModule } from 'ng-metadata/core';
import { CommentVideo } from './video-model';

@NgModule({
	providers: [{ provide: 'Comment_Video', useFactory: () => CommentVideo }],
})
export class CommentVideoModule {}
