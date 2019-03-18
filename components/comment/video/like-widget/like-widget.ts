import View from '!view!./like-widget.html';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { number } from '../../../../vue/filters/number';
import { AppAuthRequired } from '../../../auth/auth-required-directive';
import { LikersModal } from '../../../likers/modal.service';
import { Screen } from '../../../screen/screen-service';
import { CommentVote } from '../../vote/vote-model';
import { CommentVideo } from '../video-model';


@View
@Component({
	directives: {
		AppAuthRequired,
		AppTooltip,
	},
})
export class AppCommentVideoLikeWidget extends Vue {
	@Prop(CommentVideo)
	video!: CommentVideo;
	@Prop(Boolean)
	overlay?: boolean;
	@Prop(Boolean)
	circle?: boolean;
	@Prop(Boolean)
	block?: boolean;

	isProcessing = false;

	get comment() {
		return this.video.comment;
	}

	// We also show circle in xs size.
	get isCircle() {
		return this.circle || Screen.isXs;
	}

	get blip() {
		return this.isCircle && this.comment.votes ? number(this.comment.votes) : '';
	}

	get badge() {
		return !this.isCircle && this.comment.votes ? number(this.comment.votes) : '';
	}

	async toggle() {
		this.isProcessing = true;

		if (!this.comment.user_vote || this.comment.user_vote.vote === CommentVote.VOTE_DOWNVOTE) {
			await this.comment.$vote(CommentVote.VOTE_UPVOTE);
		} else {
			await this.comment.$removeVote();
		}

		this.isProcessing = false;
	}

	showLikers() {
		LikersModal.show({ count: this.comment.votes, resource: this.comment });
	}
}
