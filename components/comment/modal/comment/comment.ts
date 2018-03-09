import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./comment.html?style=./comment.styl';

import { Comment } from '../../comment-model';
import { AppCommentContent } from '../../content/content';
import { AppCommentControls } from '../../controls/controls';
import { AppMessageThreadItem } from '../../../message-thread/item/item';
import { FormComment } from '../../add/add';
import { AppMessageThreadAdd } from '../../../message-thread/add/add';
import { AppStore, AppState } from '../../../../vue/services/app/app-store';
import { AppLoading } from '../../../../vue/components/loading/loading';
import { CommentMutation, CommentStore } from '../../comment-store';

@View
@Component({
	components: {
		AppMessageThreadItem,
		AppMessageThreadAdd,
		AppCommentContent,
		AppCommentControls,
		FormComment,
		AppLoading,
	},
})
export class AppCommentModalComment extends Vue {
	@Prop(Comment) comment: Comment;

	@AppState user: AppStore['user'];
	@CommentMutation onCommentAdd: CommentStore['onCommentAdd'];

	isLoadingReplies = true;
	replies: Comment[] = [];

	_onCommentAdd(comment: Comment) {
		this.onCommentAdd(comment);
		this.$emit('add');
	}
}
