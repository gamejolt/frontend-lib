import { Component, Inject, Input, SkipSelf, OnInit } from 'ng-metadata/core';
import { Comment } from './../comment-model';
import { Comment_Video } from './../video/video-model';
import { WidgetComponent } from './widget-directive';
import template from 'html!./comment.html';

@Component({
	selector: 'gj-comment-widget-comment',
	template,
})
export class CommentComponent implements OnInit
{
	@Input( '<' ) comment: Comment;
	@Input( '<?' ) isChild?: boolean;

	isFollowPending = false;
	profileUrl: string;
	isOwner: boolean;

	canToggleComment: boolean;
	showFullComment = false;
	canFollow = true;
	canVote = true;
	votingTooltip = '';
	selectedVideo?: Comment_Video;
	isEditing = false;

	constructor(
		@Inject( '$scope' ) private $scope: ng.IScope,
		@Inject( 'Environment' ) public env: any,
		@Inject( 'App' ) public app: any,
		@Inject( 'Report_Modal' ) private reportModal: any,
		@Inject( 'gettextCatalog' ) private gettextCatalog: ng.gettext.gettextCatalog,
		@Inject( 'gjCommentWidget' ) @SkipSelf() public commentWidget: WidgetComponent,
	)
	{
	}

	ngOnInit()
	{
		this.profileUrl = this.env.wttfBaseUrl + this.comment.user.url;
		this.isOwner = this.commentWidget.resourceOwner.id == this.comment.user.id;

		// Can't subscribe if...
		// they aren't logged in
		// this is a child comment
		// the resource belongs to them
		if ( !this.app.user ) {
			this.canFollow = false;
		}
		else if ( this.isChild ) {
			this.canFollow = false;
		}
		else if ( this.commentWidget.resourceOwner.id == this.app.user.id ) {
			this.canFollow = false;
		}

		// Can't vote on this comment if...
		// they aren't logged in
		// they wrote the comment
		// the resource belongs to them (they will just upvote stuff that is nice)
		if ( !this.app.user ) {
			this.canVote = false;
		}
		else if ( this.comment.user.id == this.app.user.id ) {
			this.canVote = false;
		}
		else if ( this.commentWidget.resourceOwner.id == this.app.user.id ) {
			this.canVote = false;
		}

		this.$scope.$watch( () => this.comment.votes, ( voteCount: number ) =>
		{
			const userHasVoted = !!this.comment.user_vote;

			if ( voteCount <= 0 ) {
				if ( this.canVote ) {
					/// Tooltip for comment voting when no one has liked a comment yet.
					this.votingTooltip = this.gettextCatalog.getString( 'Give this comment some love!' );
				}
			}
			else if ( userHasVoted ) {
				if ( voteCount == 1 ) {
					/// Tooltip for comment voting when you like a comment and no one else has liked it yet.
					this.votingTooltip = this.gettextCatalog.getString( 'You like this comment' );
				}
				else {
					/// Tooltip for comment voting when you and other people like it.
					this.votingTooltip = this.gettextCatalog.getPlural( (voteCount - 1), 'You and another person like this comment.', 'You and {{ $count | number }} people like this comment.', {} );
				}
			}
			else {
				/// Tooltip for comment voting when you haven't liked it yet, but other people do.
				this.votingTooltip = this.gettextCatalog.getPlural( voteCount, 'One person likes this comment.', '{{ $count | number }} people like this comment.', {} );
			}
		} );
	}

	edit()
	{
		this.isEditing = true;
		// Popover.hideAll();
	}

	closeEdit()
	{
		this.isEditing = false;
	}

	reply()
	{
		console.log( this.isChild, this.comment );
		this.commentWidget.replyToComment( this.isChild ? this.comment.parent_id : this.comment.id );
	}

	toggleVote()
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

	toggleFollow()
	{
		if ( this.isFollowPending ) {
			return;
		}

		this.isFollowPending = true;

		// if ( !this.commentWidget.subscriptions[ scope.comment.id ] ) {

		// 	Subscription.$subscribe( scope.comment.id )
		// 		.then( function( newSubscription )
		// 		{
		// 			scope.ctrl.subscriptions[ scope.comment.id ] = newSubscription;
		// 			scope.isFollowPending = false;
		// 		} );
		// }
		// else {

		// 	scope.ctrl.subscriptions[ scope.comment.id ].$remove()
		// 		.then( function()
		// 		{
		// 			delete scope.ctrl.subscriptions[ scope.comment.id ];
		// 			scope.isFollowPending = false;
		// 		} );
		// }
	}

	selectVideo( video: Comment_Video )
	{
		if ( this.selectedVideo === video ) {
			this.selectedVideo = undefined;
		}
		else {
			this.selectedVideo = video;
		}
	}

	report( comment: Comment )
	{
		this.reportModal.show( comment );
	}
}
