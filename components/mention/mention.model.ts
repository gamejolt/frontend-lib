import { Model } from '../model/model.service';
import { User } from '../user/user.model';
import { Comment } from '../comment/comment-model';
import { ForumPost } from '../forum/post/post.model';

export class Mention extends Model {
	user!: User;
	resource!: 'Comment' | 'Game' | 'User' | 'Fireside_Post' | 'Forum_Post';
	resource_id!: number;
	mentioned_user!: User;
	status!: string;
	comment!: Comment;
	forum_post!: ForumPost;

	constructor(data: any = {}) {
		super(data);

		if (data.user) {
			this.user = new User(data.user);
		}

		if (data.mentioned_user) {
			this.mentioned_user = new User(data.mentioned_user);
		}

		if (data.comment) {
			this.comment = new Comment(data.comment);
		}

		if (data.forum_post) {
			this.forum_post = new ForumPost(data.forum_post);
		}
	}
}

Model.create(Mention);
