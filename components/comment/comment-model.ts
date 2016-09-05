import { Injectable } from 'ng-metadata/core';
import { Model } from './../model/model-service';
import { Comment_Video } from './video/video-model';
import { Comment_Vote } from './vote/vote-model';

export function CommentFactory( $q: any, Model: any, Api: any, User: any, Comment_Video: any, Comment_Vote: any, Subscription: any )
{
	return Model.create( Comment, {
		$q,
		Api,
		User,
		Comment_Video,
		Comment_Vote,
		Subscription,
	} );
}

@Injectable()
export class Comment extends Model
{
	parent_id: number;
	resource: string;
	resource_id: number;
	user: any;
	comment_compiled: string;
	votes: number;
	user_vote?: Comment_Vote;
	status: number;
	posted_on: number;
	lang: string;
	videos: Comment_Video[];
	subscription?: any;

	isVotePending: boolean = false;
	isFollowPending: boolean = false;

	static $q: ng.IQService;
	static Api: any;
	static User: any;
	static Comment_Video: typeof Comment_Video;
	static Comment_Vote: typeof Comment_Vote;
	static Subscription: any;

	static STATUS_REMOVED = 0;
	static STATUS_VISIBLE = 1;
	static STATUS_SPAM = 2;

	constructor( data?: any )
	{
		super( data );

		if ( data && data.user ) {
			this.user = new Comment.User( data.user );
		}

		if ( data && data.videos ) {
			this.videos = Comment.Comment_Video.populate( data.videos );
		}

		if ( data && data.user_vote ) {
			this.user_vote = new Comment.Comment_Vote( data.user_vote );
		}

		if ( data && data.subscription ) {
			this.subscription = new Comment.Subscription( data.subscription );
		}
	}

	static fetch( resource: string, resourceId: number, page: number )
	{
		let query = '';
		if ( page ) {
			query = '?page=' + page;
		}

		return Comment.Api.sendRequest( `/comments/${resource}/${resourceId}${query}`, null, { detach: true } );
	}

	static getCommentPage( commentId: number ): ng.IPromise<number>
	{
		return Comment.Api.sendRequest( `/comments/get-comment-page/${commentId}`, null, { detach: true } )
			.then( ( response: any ) =>
			{
				if ( !response || response.error ) {
					return Comment.$q.reject( response.error );
				}

				return response.page;
			} );
	}

	static getCommentUrl( commentId: number ): ng.IPromise<string>
	{
		return Comment.Api.sendRequest( `/comments/get-comment-url/${commentId}`, null, { detach: true } )
			.then( ( response: any ) =>
			{
				if ( !response || response.error ) {
					return Comment.$q.reject( response.error );
				}

				return response.url;
			} );
	}

	$save()
	{
		if ( !this.id ) {
			return this.$_save( `/comments/add/${this.resource}/${this.resource_id}`, 'comment' );
		}
		return this.$_save( `/comments/edit/${this.id}`, 'comment' );
	}

	$like()
	{
		if ( this.isVotePending ) {
			return;
		}
		this.isVotePending = true;

		const newVote = new Comment.Comment_Vote( { comment_id: this.id } );

		newVote.$save()
			.then( () =>
			{
				this.user_vote = newVote;
				++this.votes;
				this.isVotePending = false;
			} );
	}

	$removeLike()
	{
		if ( !this.user_vote || this.isVotePending ) {
			return;
		}
		this.isVotePending = true;

		this.user_vote.$remove()
			.then( () =>
			{
				this.user_vote = undefined;
				--this.votes;
				this.isVotePending = false;
			} );
	}

	$follow()
	{
		if ( this.isFollowPending ) {
			return;
		}
		this.isFollowPending = true;

		Comment.Subscription.$subscribe( this.id )
			.then( ( subscription: any ) =>
			{
				this.subscription = subscription;
				this.isFollowPending = false;
			} );
	}

	$removeFollow()
	{
		if ( !this.subscription || this.isFollowPending ) {
			return;
		}
		this.isFollowPending = true;

		this.subscription.$remove()
			.then( () =>
			{
				this.subscription = undefined;
				this.isFollowPending = false;
			} );
	}
}
