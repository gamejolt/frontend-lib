import { Model } from '../model/model.service';
import { CommentVideo } from './video/video-model';
import { CommentVote } from './vote/vote-model';
import { User } from '../user/user.model';
import { Api } from '../api/api.service';
import { Environment } from '../environment/environment.service';

export class Comment extends Model
{
	static readonly STATUS_REMOVED = 0;
	static readonly STATUS_VISIBLE = 1;
	static readonly STATUS_SPAM = 2;

	parent_id: number;
	resource: string;
	resource_id: number;
	user: User;
	comment?: string;
	comment_compiled: string;
	votes: number;
	user_vote?: CommentVote;
	status: number;
	posted_on: number;
	lang: string;
	videos: CommentVideo[] = [];

	isVotePending: boolean = false;

	get permalink()
	{
		return Environment.baseUrl + '/x/permalink/comment/' + this.id;
	}

	constructor( data: any = {} )
	{
		super( data );

		if ( data.user ) {
			this.user = new User( data.user );
		}

		if ( data.videos ) {
			this.videos = CommentVideo.populate( data.videos );
		}

		if ( data.user_vote ) {
			this.user_vote = new CommentVote( data.user_vote );
		}
	}

	static fetch( resource: string, resourceId: number, page: number )
	{
		let query = '';
		if ( page ) {
			query = '?page=' + page;
		}

		return Api.sendRequest( `/comments/${resource}/${resourceId}${query}`, null, { detach: true } );
	}

	static async getCommentPage( commentId: number ): Promise<number>
	{
		const response = await Api.sendRequest( `/comments/get-comment-page/${commentId}`, null, { detach: true } );

		if ( !response || response.error ) {
			return Promise.reject( response.error );
		}

		return response.page;
	}

	static async getCommentUrl( commentId: number ): Promise<string>
	{
		const response = await Api.sendRequest( `/comments/get-comment-url/${commentId}`, null, { detach: true } );

		if ( !response || response.error ) {
			return Promise.reject( response.error );
		}

		return response.url;
	}

	$save()
	{
		return this.$_save( `/comments/add/${this.resource}/${this.resource_id}`, 'comment', { detach: true } );
	}

	async $like()
	{
		if ( this.isVotePending ) {
			return;
		}
		this.isVotePending = true;

		const newVote = new CommentVote( { comment_id: this.id } );

		await newVote.$save();

		this.user_vote = newVote;
		++this.votes;
		this.isVotePending = false;
	}

	async $removeLike()
	{
		if ( !this.user_vote || this.isVotePending ) {
			return;
		}
		this.isVotePending = true;

		await this.user_vote.$remove();

		this.user_vote = undefined;
		--this.votes;
		this.isVotePending = false;
	}
}

Model.create( Comment );
