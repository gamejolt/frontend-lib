import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./controls.html';

import { Comment } from '../comment-model';
import { AppAuthRequired } from '../../auth/auth-required-directive.vue';
import { AppTooltip } from '../../tooltip/tooltip';
import { number } from '../../../vue/filters/number';
import { AppJolticon } from '../../../vue/components/jolticon/jolticon';
import { AppTrackEvent } from '../../analytics/track-event.directive.vue';
import { State } from 'vuex-class';
import { AppStore } from '../../../vue/services/app/app-store';
import { CommentModal } from '../modal/modal.service';

@View
@Component({
	components: {
		AppJolticon,
	},
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
	@Prop(Comment) comment: Comment;
	@Prop(Boolean) showReply?: boolean;

	@State app: AppStore;

	get canVote() {
		// Can't vote on this comment if they wrote the comment. We allow them to try voting if
		// guest since we show the auth required popup.
		return !this.app.user || this.comment.user.id !== this.app.user.id;
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

	onVoteClick() {
		if (!this.comment.user_vote) {
			this.comment.$like();
		} else {
			this.comment.$removeLike();
		}
	}

	async onReplyClick() {
		const comment = await CommentModal.show({ comment: this.comment });
		if (comment) {
			this.$emit('reply', comment);
		}
	}
}
