import View from '!view!./modal.html';
import {
	CommentState,
	CommentStore,
} from 'game-jolt-frontend-lib/components/comment/comment-store';
import { BaseModal } from 'game-jolt-frontend-lib/components/modal/base';
import { AppState, AppStore } from 'game-jolt-frontend-lib/vue/services/app/app-store';
import { Component, Prop } from 'vue-property-decorator';
import { Analytics } from '../../analytics/analytics.service';
import { AppMessageThreadAdd } from '../../message-thread/add/add';
import { FormComment } from '../add/add';
import { Comment } from '../comment-model';
import { CommentMutation } from '../comment-store';
import { DisplayMode } from '../modal/modal.service';
import { AppCommentWidget } from '../widget/widget';

@View
@Component({
	components: {
		AppCommentWidget,
		FormComment,
		AppMessageThreadAdd,
	},
})
export default class AppCommentThreadModal extends BaseModal {
	@Prop(Number)
	commentId!: number;

	@Prop(String)
	resource!: string;

	@Prop(Number)
	resourceId!: number;

	@Prop(String)
	displayMode!: DisplayMode;

	@AppState
	user!: AppStore['user'];

	@CommentState
	getCommentStore!: CommentStore['getCommentStore'];

	@CommentMutation
	onCommentAdd!: CommentStore['onCommentAdd'];

	hasError = false;

	get parent() {
		const store = this.getCommentStore(this.resource, this.resourceId);
		if (store) {
			const comment = store.comments.find(c => c.id === this.commentId);
			if (comment && comment.parent_id) {
				const parent = store.comments.find(c => c.id === comment.parent_id);
				return parent;
			}
			return comment;
		}
	}

	get username() {
		const store = this.getCommentStore(this.resource, this.resourceId);
		if (store) {
			const comment = store.comments.find(c => c.id === this.commentId);
			if (comment) {
				return comment.user.username;
			}
		}
	}

	get displayModeTitle() {
		switch (this.displayMode) {
			case 'comments':
				return this.$gettext('Comment');
			case 'shouts':
				return this.$gettext('Shout');
		}
		return '';
	}

	_onCommentAdd(comment: Comment) {
		Analytics.trackEvent('comment-widget', 'add');
		this.onCommentAdd(comment);
		this.$emit('add', comment);
	}

	onRemove(_comment: Comment) {
		// If the parent comment of the thread got removed, close this modal
		if (!this.parent) {
			this.modal.dismiss();
		}
	}

	onError(_e: Error) {
		this.hasError = true;
	}
}
