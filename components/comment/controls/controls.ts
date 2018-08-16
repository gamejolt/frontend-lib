import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./controls.html';

import { Comment } from '../comment-model';
import { AppAuthRequired } from '../../auth/auth-required-directive.vue';
import { AppTooltip } from '../../tooltip/tooltip';
import { number } from '../../../vue/filters/number';
import { AppTrackEvent } from '../../analytics/track-event.directive.vue';
import { CommentModal } from '../modal/modal.service';

@View
@Component({
	directives: {
		AppAuthRequired,
		AppTooltip,
		AppTrackEvent,
	},
	filters: {
		number,
	},
})
export class AppCommentControls extends Vue {
	@Prop(Comment) comment!: Comment;
	@Prop(Boolean) showReply?: boolean;

	get votingTooltip() {
		const userHasVoted = !!this.comment.user_vote;
		const count = this.comment.votes;

		if (count <= 0) {
			return this.$gettext('Give this comment some love!');
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

	onVoteClick() {
		if (!this.comment.user_vote) {
			this.comment.$like();
		} else {
			this.comment.$removeLike();
		}
	}

	onReplyClick() {
		CommentModal.show({ comment: this.comment });
	}
}
