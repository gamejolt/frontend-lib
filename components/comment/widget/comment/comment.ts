import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import View from '!view!./comment.html';

import { Environment } from '../../../environment/environment.service';
import { AppCommentWidget } from '../widget';
import { findRequiredVueParent } from '../../../../utils/vue';
import { Comment } from '../../comment-model';
import { AppStore } from '../../../../vue/services/app/app-store';
import { AppFadeCollapse } from '../../../fade-collapse/fade-collapse';
import { AppTrackEvent } from '../../../analytics/track-event.directive.vue';
import { AppJolticon } from '../../../../vue/components/jolticon/jolticon';
import { AppTooltip } from '../../../tooltip/tooltip';
import { AppPopover } from '../../../popover/popover';
import { AppPopoverTrigger } from '../../../popover/popover-trigger.directive.vue';
import { ReportModal } from '../../../report/modal/modal.service';
import { date } from '../../../../vue/filters/date';
import { AppMessageThreadItem } from '../../../message-thread/item/item';
import { number } from '../../../../vue/filters/number';
import { AppExpand } from '../../../expand/expand';
import { FormComment } from '../../add/add';
import { Clipboard } from '../../../clipboard/clipboard-service';
import { AppMessageThreadAdd } from '../../../message-thread/add/add';
import { AppAuthRequired } from '../../../auth/auth-required-directive.vue';
import { AppMessageThread } from '../../../message-thread/message-thread';
import { Popover } from '../../../popover/popover.service';
import { ModalConfirm } from '../../../modal/confirm/confirm-service';
import { AppCommentControls } from '../../controls/controls';
import { AppCommentContent } from '../../content/content';

let CommentNum = 0;

@View
@Component({
	components: {
		AppCommentControls,
		AppCommentContent,
		AppMessageThread,
		AppMessageThreadItem,
		AppMessageThreadAdd,
		AppFadeCollapse,
		AppJolticon,
		AppPopover,
		AppExpand,
		FormComment,

		// Since it's recursive it needs to be able to resolve itself.
		AppCommentWidgetComment: () => Promise.resolve(AppCommentWidgetComment),
	},
	directives: {
		AppTrackEvent,
		AppTooltip,
		AppPopoverTrigger,
		AppAuthRequired,
	},
	filters: {
		number,
		date,
	},
})
export class AppCommentWidgetComment extends Vue {
	@Prop(Comment) comment: Comment;
	@Prop(Array) children?: Comment[];
	@Prop(Comment) parent?: Comment;
	@Prop(String) resource: string;
	@Prop(Number) resourceId: number;
	@Prop(Boolean) isLastInThread?: boolean;

	@State app: AppStore;

	componentId = ++CommentNum;
	isFollowPending = false;
	isShowingChildren = false;
	isEditing = false;

	widget: AppCommentWidget;

	readonly date = date;
	readonly Environment = Environment;

	created() {
		this.widget = findRequiredVueParent(this, AppCommentWidget);
	}

	get isChild() {
		return !!this.parent;
	}

	get isOwner() {
		if (!this.widget.resourceOwner) {
			return false;
		}

		return this.widget.resourceOwner.id === this.comment.user.id;
	}

	get isCollaborator() {
		if (!this.widget.collaborators.length) {
			return false;
		}

		return !!this.widget.collaborators.find(
			collaborator => collaborator.user_id === this.comment.user.id
		);
	}

	get canRemove() {
		if (!this.app.user) {
			return false;
		}

		// The comment author can remove.
		if (this.app.user.id === this.comment.user.id) {
			return true;
		}

		// The owner of the resource the comment is attached to can remove.
		if (this.widget.resourceOwner && this.widget.resourceOwner.id === this.app.user.id) {
			return true;
		}

		// A collaborator for the game the comment is attached to can remove,
		// if they have the comments permission.
		if (this.widget.collaborators) {
			const collaborator = this.widget.collaborators.find(
				item => item.user_id === this.app.user!.id
			);

			if (
				collaborator &&
				(collaborator.perms.indexOf('comments') !== -1 ||
					collaborator.perms.indexOf('all') !== -1)
			) {
				return true;
			}
		}

		return false;
	}

	get isShowingReplies() {
		return this.children && this.children.length && this.isShowingChildren;
	}

	get canFollow() {
		// Can't subscribe if...
		// they aren't logged in
		// this is a child comment
		// the resource belongs to them
		if (!this.app.user) {
			return false;
		} else if (this.isChild) {
			return false;
		} else if (this.widget.resourceOwner && this.widget.resourceOwner.id === this.app.user.id) {
			return false;
		}

		return true;
	}

	startEdit() {
		this.isEditing = true;
		Popover.hideAll();
	}

	onCommentEdited(comment: Comment) {
		this.isEditing = false;
		this.widget.onCommentEdited(comment);
	}

	onReplyAdd(reply: Comment) {
		this.widget.onCommentAdd(reply);
	}

	async removeComment() {
		this.isEditing = false;
		Popover.hideAll();

		const result = await ModalConfirm.show(
			this.$gettext(`Are you sure you want to remove this comment?`),
			undefined,
			'yes'
		);

		if (!result) {
			return;
		}

		try {
			await this.comment.$remove();
		} catch (err) {
			console.warn('Failed to remove comment');
			return;
		}

		this.widget.onCommentRemoved(this.comment);
	}

	onFollowClick() {
		if (!this.comment.subscription) {
			this.comment.$follow();
		} else {
			this.comment.$removeFollow();
		}
	}

	copyPermalink() {
		Clipboard.copy(this.comment.permalink);
	}

	report() {
		ReportModal.show(this.comment);
	}
}
