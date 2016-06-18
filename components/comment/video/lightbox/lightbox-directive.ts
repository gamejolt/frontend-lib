import { Component, Inject, Input, Output } from 'ng-metadata/core';
import { App } from './../../../../../../app/app-service.ts';
import { Screen } from './../../../screen/screen-service';
import { HistoryTick } from './../../../history-tick/history-tick-service';
import { Comment } from './../../comment-model';
import { Comment_Video } from '../video-model';
import template from './lightbox.html';

@Component({
	selector: 'gj-comment-video-lightbox',
	template,
})
export class LightboxComponent
{
	@Input( '<' ) video: Comment_Video;
	@Output() onClose: Function;

	canVote = true;
	maxHeight: number;
	maxWidth: number;

	constructor(
		@Inject( '$scope' ) private $scope: any,
		@Inject( '$location' ) private $location: ng.ILocationService,
		@Inject( 'hotkeys' ) private hotkeys: ng.hotkeys.HotkeysProvider,
		@Inject( 'App' ) private app: App,
		@Inject( 'Environment' ) private environment: any,
		@Inject( 'Screen' ) private screen: Screen,
		@Inject( 'Comment' ) private comment: typeof Comment,
		@Inject( 'HistoryTick' ) private historyTick: HistoryTick
	)
	{
		this.historyTick.sendBeacon( 'comment-video', this.video.id );

		// Can't vote on this comment if...
		// they aren't logged in
		// they wrote the comment
		// the resource belongs to them (they will just upvote stuff that is nice)
		this.canVote = true;
		if ( !app.user ) {
			this.canVote = false;
		}
		else if ( this.video.comment.user.id == app.user.id ) {
			this.canVote = false;
		}
		else if ( this.video.game.developer.id == app.user.id ) {
			this.canVote = false;
		}

		this.calcMaxDimensions();

		screen.setResizeSpy( $scope, () =>
		{
			this.calcMaxDimensions();
		} );

		hotkeys.bindTo( $scope )
			.add( {
				combo: 'esc',
				description: 'Close video lightbox.',
				callback: $event =>
				{
					this.onClose();
					$event.preventDefault();
				},
			} );
	}

	calcMaxDimensions()
	{
		if ( this.screen.isXs ) {
			this.maxWidth = this.screen.width;
			this.maxHeight = this.screen.height;
		}
		else {
			this.maxWidth = (this.screen.width * 0.8);
			this.maxHeight = this.screen.height - (80 * 2);
		}
	}

	toggleVote()
	{
		// If adding a vote.
		if ( !this.video.comment.userVote ) {
			this.video.comment.$like();
		}
		// If removing a vote.
		else {
			this.video.comment.$removeLike();
		}
	}

	reply()
	{
		this.comment.getCommentUrl( this.video.comment.id )
			.then( url =>
			{
				const search = this.environment.baseUrl;
				if ( url.search( search ) === 0 ) {
					url = url.replace( search, '' );
				}
				this.$location.url( url );
				this.onClose();
			} );
	}
}
