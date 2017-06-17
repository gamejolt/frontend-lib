import { NgModule } from 'ng-metadata/core';
import { makeComponentProvider } from '../../../vue/angular-link';
import { AppCommentWidget } from './widget';

@NgModule({
	declarations: [makeComponentProvider(AppCommentWidget)],
})
export class CommentWidgetModule {}
