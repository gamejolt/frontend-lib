import { Model } from '../model/model.service';
import { CommentVideo } from './video/video-model';
import { CommentVote } from './vote/vote-model';
import { User } from '../user/user.model';
import { Api } from '../api/api.service';
import { Environment } from '../environment/environment.service';
import { Subscription } from '../subscription/subscription.model';

export async function fetchComment(id: number) {
	try {
		const payload = await Api.sendRequest(`/comments/get-comment/${id}`, null, {
			detach: true,
		});
		return new Comment(payload.comment);
	} catch (e) {
		// Probably removed.
	}
}

/**
 * @param options scrollId is a timestamp that controls where fetching starts (posted_on)
 */
export async function fetchComments(
	resource: string,
	resourceId: number,
	sort: string,
	options: { scrollId?: number | null; page?: number | null }
) {
	const { scrollId, page } = options;
	let query = '';

	if (scrollId) {
		query = '?scroll_id=' + scrollId;
	}

	if (page) {
		query = '?page=' + page;
	}

	return Api.sendRequest(`/comments/${resource}/${resourceId}/${sort}${query}`, {
		detach: true,
	});
}

export async function getCommentUrl(commentId: number): Promise<string> {
	const response = await Api.sendRequest(`/comments/get-comment-url/${commentId}`, null, {
		detach: true,
	});

	if (!response || response.error) {
		return Promise.reject(response.error);
	}

	return response.url;
}

export class Comment extends Model {
	static readonly STATUS_REMOVED = 0;
	static readonly STATUS_VISIBLE = 1;
	static readonly STATUS_SPAM = 2;

	static readonly SORT_HOT = 'hot';
	static readonly SORT_TOP = 'top';
	static readonly SORT_NEW = 'new';
	static readonly SORT_YOU = 'you';

	parent_id!: number;
	resource!: 'Game' | 'FiresidePost';
	resource_id!: number;
	user!: User;
	comment?: string;
	comment_compiled!: string;
	votes!: number;
	user_vote?: CommentVote;
	status!: number;
	posted_on!: number;
	modified_on?: number;
	lang!: string;
	videos: CommentVideo[] = [];
	subscription?: Subscription;
	is_pinned!: boolean;

	isVotePending = false;
	isFollowPending = false;

	get permalink() {
		return Environment.baseUrl + '/x/permalink/comment/' + this.id;
	}

	constructor(data: any = {}) {
		super(data);

		if (data.user) {
			this.user = new User(data.user);
		}

		if (data.videos) {
			this.videos = CommentVideo.populate(data.videos);
		}

		if (data.user_vote) {
			this.user_vote = new CommentVote(data.user_vote);
		}

		if (data.subscription) {
			this.subscription = new Subscription(data.subscription);
		}
	}

	$save() {
		if (!this.id) {
			return this.$_save(`/comments/save`, 'comment', {
				detach: true,
			});
		} else {
			return this.$_save(`/comments/save/${this.id}`, 'comment', {
				detach: true,
			});
		}
	}

	$remove() {
		if (!this.id) {
			throw new Error('Tried removing a comment that does not exist');
		} else {
			return this.$_remove(`/comments/remove/${this.id}`, {
				detach: true,
			});
		}
	}

	async $vote(vote: number) {
		// Don't do anything if they are setting the same vote.
		if (this.isVotePending || (this.user_vote && this.user_vote.vote === vote)) {
			return;
		}
		this.isVotePending = true;

		const newVote = new CommentVote({ comment_id: this.id, vote });
		await newVote.$save();

		const hadPreviousVote = !!this.user_vote;
		this.user_vote = newVote;

		// We only show upvotes. So we only want to change when it's upvoted, or we decrement 1 if
		// they had previously set it to upvote and are changing to downvote to signify the removal
		// of the upvote only.
		if (vote === CommentVote.VOTE_UPVOTE) {
			++this.votes;
		} else if (hadPreviousVote) {
			// Their previous vote had to be an upvote in this case.
			--this.votes;
		}

		this.isVotePending = false;
	}

	async $removeVote() {
		if (!this.user_vote || this.isVotePending) {
			return;
		}
		this.isVotePending = true;

		await this.user_vote.$remove();

		// Votes only show upvotes, so don't modify vote count if it was a downvote.
		if (this.user_vote.vote === CommentVote.VOTE_UPVOTE) {
			--this.votes;
		}

		this.user_vote = undefined;
		this.isVotePending = false;
	}

	async $follow() {
		if (this.subscription || this.isFollowPending) {
			return;
		}
		this.isFollowPending = true;

		const subscription = await Subscription.$subscribe(this.id);
		this.subscription = subscription;
		this.isFollowPending = false;
	}

	async $removeFollow() {
		if (!this.subscription || this.isFollowPending) {
			return;
		}
		this.isFollowPending = true;

		await this.subscription.$remove();
		this.subscription = undefined;
		this.isFollowPending = false;
	}

	// applies pin operation to current comment and returns the comment that
	// got unpinned (or null if that didn't happen)
	async $pin(): Promise<Comment | null> {
		const result = await this.$_save(`/comments/pin/${this.id}`, 'comment');
		return result['otherComment'] ? new Comment(result['otherComment']) : null;
	}
}

Model.create(Comment);
