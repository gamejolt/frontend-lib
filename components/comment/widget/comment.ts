import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as View from '!view!./comment.html?style=./comment.styl';

import { Environment } from '../../environment/environment.service';
import { AppCommentWidget } from './widget';
import { findVueParent } from '../../../utils/vue';
import { Comment } from '../comment-model';
import { AppState } from '../../../vue/services/app/app-store';
import { Subscription } from '../../subscription/subscription.model';
import { CommentVideo } from '../video/video-model';
import { AppUserAvatar } from '../../user/user-avatar/user-avatar';
import { AppTimeAgo } from '../../time/ago/ago';
import { AppFadeCollapse } from '../../fade-collapse/fade-collapse';
import { AppTrackEvent } from '../../analytics/track-event.directive.vue';
import { AppJolticon } from '../../../vue/components/jolticon/jolticon';
import { AppTooltip } from '../../tooltip/tooltip';
import { AppPopover } from '../../popover/popover';
import { AppPopoverTrigger } from '../../popover/popover-trigger.directive.vue';
import { AppCommentVideoThumbnail } from '../video/thumbnail/thumbnail';

@View
@Component({
	components: {
		AppUserAvatar,
		AppTimeAgo,
		AppFadeCollapse,
		AppJolticon,
		AppPopover,
		AppCommentVideoThumbnail,
	},
	directives: {
		AppTrackEvent,
		AppTooltip,
		AppPopoverTrigger,
	},
})
export class AppCommentWidgetComment extends Vue
{
	@Prop( Comment ) comment: Comment;
	@Prop( Boolean ) isChild?: boolean;
	@Prop( Boolean ) isHighlighted?: boolean;

	@State app: AppState;

	canToggleComment = false;
	showFullComment = false;
	selectedVideo: CommentVideo | null = null;
	showAllVideos = false;
	isFollowPending = false;

	widget: AppCommentWidget;
	Environment = Environment;

	created()
	{
		this.widget = findVueParent( this, AppCommentWidget ) as AppCommentWidget;
	}

	get isOwner()
	{
		if ( !this.widget.resourceOwner ) {
			return false;
		}

		return this.widget.resourceOwner.id === this.comment.user.id;
	}

	get canFollow()
	{
		// Can't subscribe if...
		// they aren't logged in
		// this is a child comment
		// the resource belongs to them
		if ( !this.app.user ) {
			return false;
		}
		else if ( this.isChild ) {
			return false;
		}
		else if ( this.widget.resourceOwner && this.widget.resourceOwner.id === this.app.user.id ) {
			return false;
		}

		return true;
	}

	get canVote()
	{
		// Can't vote on this comment if...
		// they aren't logged in
		// they wrote the comment
		// the resource belongs to them (they will just upvote stuff that is nice)
		if ( !this.app.user ) {
			return false;
		}
		else if ( this.comment.user.id === this.app.user.id ) {
			return false;
		}
		else if ( this.widget.resourceOwner && this.widget.resourceOwner.id === this.app.user.id ) {
			return false;
		}

		return true;
	}

	get votingTooltip()
	{
		const userHasVoted = !!this.comment.user_vote;
		const voteCount = this.comment.votes;

		if ( voteCount <= 0 ) {
			if ( this.canVote ) {
				return this.$gettext( 'Give this comment some love!' );
			}
		}
		else if ( userHasVoted ) {
			if ( voteCount === 1 ) {
				return this.$gettext( 'You like this comment' );
			}
			else {
				return this.$ngettext(
					'You and another person like this comment.',
					'You and %{ $count } people like this comment.',
					(voteCount - 1),
				);
			}
		}
		else {
			return this.$ngettext(
				'One person likes this comment.',
				'%{ $count } people like this comment.',
				voteCount,
			);
		}
	}

	onReplyClick()
	{
		this.widget.replyToComment( this.comment );
	}

	onVoteClick()
	{
		// If adding a vote.
		if ( !this.comment.user_vote ) {
			this.comment.$like();
		}
		// If removing a vote.
		else {
			this.comment.$removeLike();
		}
	}

	async onFollowClick()
	{
		if ( this.isFollowPending ) {
			return;
		}

		this.isFollowPending = true;

		if ( !this.widget.subscriptions[ this.comment.id ] ) {

			const newSubscription = await Subscription.$subscribe( this.comment.id );

			Vue.set( this.widget.subscriptions, this.comment.id + '', newSubscription );
			this.isFollowPending = false;
		}
		else {

			await this.widget.subscriptions[ this.comment.id ].$remove();

			Vue.delete( this.widget.subscriptions, this.comment.id + '' );
			this.isFollowPending = false;
		}
	}

	selectVideo( video: CommentVideo )
	{
		if ( this.selectedVideo === video ) {
			this.selectedVideo = null;
		}
		else {
			this.selectedVideo = video;
		}
	}

	report( comment: Comment )
	{
		console.log( 'show report modal', comment );
		// TODO
		// Report_Modal.show( comment );
	}
}
