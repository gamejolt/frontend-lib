import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as View from '!view!./comment.html?style=./comment.styl';
import './comment-content.styl';

import { Environment } from '../../../environment/environment.service';
import { AppCommentWidget } from '../widget';
import { findRequiredVueParent } from '../../../../utils/vue';
import { Comment } from '../../comment-model';
import { AppStore } from '../../../../vue/services/app/app-store';
import { Subscription } from '../../../subscription/subscription.model';
import { CommentVideo } from '../../video/video-model';
import { AppFadeCollapse } from '../../../fade-collapse/fade-collapse';
import { AppTrackEvent } from '../../../analytics/track-event.directive.vue';
import { AppJolticon } from '../../../../vue/components/jolticon/jolticon';
import { AppTooltip } from '../../../tooltip/tooltip';
import { AppPopover } from '../../../popover/popover';
import { AppPopoverTrigger } from '../../../popover/popover-trigger.directive.vue';
import { AppCommentVideoThumbnail } from '../../video/thumbnail/thumbnail';
import { ReportModal } from '../../../report/modal/modal.service';
import { date } from '../../../../vue/filters/date';
import { AppMessageThreadItem } from '../../../message-thread/item/item';
import { number } from '../../../../vue/filters/number';
import { AppExpand } from '../../../expand/expand';
import { AppScrollWhen } from '../../../scroll/scroll-when.directive.vue';
import { AppCommentWidgetAdd } from '../add/add';
import { Clipboard } from '../../../clipboard/clipboard-service';
import { Scroll } from '../../../scroll/scroll.service';
import { AppMessageThreadAdd } from '../../../message-thread/add/add';

@View
@Component({
	components: {
		AppMessageThreadItem,
		AppMessageThreadAdd,
		AppFadeCollapse,
		AppJolticon,
		AppPopover,
		AppCommentVideoThumbnail,
		AppExpand,
		AppCommentWidgetAdd,

		// Since it's recursive it needs to be able to resolve itself.
		AppCommentWidgetComment: () => Promise.resolve(AppCommentWidgetComment),
	},
	directives: {
		AppTrackEvent,
		AppTooltip,
		AppPopoverTrigger,
		AppScrollWhen,
	},
	filters: {
		number,
	},
})
export class AppCommentWidgetComment extends Vue {
	@Prop(Comment) comment: Comment;
	@Prop(Array) children?: Comment[];
	@Prop(Comment) parent?: Comment;
	@Prop(String) resource: string;
	@Prop(Number) resourceId: number;

	@State app: AppStore;

	canToggleContent = false;
	showFullContent = false;
	selectedVideo: CommentVideo | null = null;
	showAllVideos = false;
	isFollowPending = false;
	isShowingChildren = false;
	isReplying = false;
	isHighlighted = false;

	widget: AppCommentWidget;

	date = date;
	Environment = Environment;

	created() {
		this.widget = findRequiredVueParent(this, AppCommentWidget);
	}

	mounted() {
		this.checkPermalink();
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

	get isShowingReplies() {
		return (this.children && this.children.length && this.isShowingChildren) || this.isReplying;
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

	get canVote() {
		// Can't vote on this comment if...
		// they aren't logged in
		// they wrote the comment
		// the resource belongs to them (they will just upvote stuff that is nice)
		if (!this.app.user) {
			return false;
		} else if (this.comment.user.id === this.app.user.id) {
			return false;
		} else if (this.widget.resourceOwner && this.widget.resourceOwner.id === this.app.user.id) {
			return false;
		}

		return true;
	}

	get votingTooltip() {
		const userHasVoted = !!this.comment.user_vote;
		const count = this.comment.votes;

		if (count <= 0) {
			if (this.canVote) {
				return this.$gettext('Give this comment some love!');
			}
		} else if (userHasVoted) {
			if (count === 1) {
				return this.$gettext('You like this comment');
			} else {
				return this.$gettextInterpolate(
					this.$ngettext(
						'You and another person like this comment.',
						'You and %{ count } people like this comment.',
						count - 1
					),
					{ count }
				);
			}
		} else {
			return this.$gettextInterpolate(
				this.$ngettext(
					'One person likes this comment.',
					'%{ count } people like this comment.',
					count
				),
				{ count }
			);
		}
	}

	onReplyAdd(formModel: Comment) {
		this.widget.onCommentAdd(formModel, true);
	}

	onVoteClick() {
		// If adding a vote.
		if (!this.comment.user_vote) {
			this.comment.$like();
		} else {
			// If removing a vote.
			this.comment.$removeLike();
		}
	}

	async onFollowClick() {
		if (this.isFollowPending) {
			return;
		}

		this.isFollowPending = true;

		if (!this.widget.subscriptions[this.comment.id]) {
			const newSubscription = await Subscription.$subscribe(this.comment.id);

			Vue.set(this.widget.subscriptions, this.comment.id + '', newSubscription);
			this.isFollowPending = false;
		} else {
			await this.widget.subscriptions[this.comment.id].$remove();

			Vue.delete(this.widget.subscriptions, this.comment.id + '');
			this.isFollowPending = false;
		}
	}

	selectVideo(video: CommentVideo) {
		if (this.selectedVideo === video) {
			this.selectedVideo = null;
		} else {
			this.selectedVideo = video;
		}
	}

	copyPermalink() {
		Clipboard.copy(this.comment.permalink);
	}

	report() {
		ReportModal.show(this.comment);
	}

	private checkPermalink() {
		const hash = this.$route.hash;
		if (hash === '#comment-' + this.comment.id) {
			this.isHighlighted = true;
			Scroll.to('comment-' + this.comment.id);
		}
	}
}
