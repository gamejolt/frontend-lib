import { Model } from '../../model/model.service';

export class CommentVote extends Model {
	static readonly VOTE_UPVOTE = 1;
	static readonly VOTE_DOWNVOTE = 0;

	comment_id!: number;
	user_id!: number;
	posted_on!: number;
	vote!: number;

	$save() {
		return this.$_save(
			'/comments/votes/add/' + this.comment_id + '/' + this.vote,
			'commentVote',
			{
				detach: true,
				ignorePayloadUser: true,
			}
		);
	}

	$remove() {
		return this.$_remove('/comments/votes/remove/' + this.id, {
			detach: true,
			ignorePayloadUser: true,
		});
	}
}

Model.create(CommentVote);
