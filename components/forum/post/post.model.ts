import { Model } from '../../model/model.service';
import { User } from '../../user/user.model';
import { Notification } from '../../notification/notification-model';
import { ForumTopic } from '../topic/topic.model';
import { Api } from '../../api/api.service';
import { Environment } from '../../environment/environment.service';

export class ForumPost extends Model {
	static readonly STATUS_ACTIVE = 'active';
	static readonly STATUS_SPAM = 'spam';
	static readonly STATUS_REMOVED = 'removed';

	user_id!: number;
	user!: User;
	topic_id!: number;
	parent_post_id!: number;
	content_markdown!: string;
	content_compiled!: string;
	status!: string;
	posted_on!: number;
	replied_to?: User;
	replies_count?: number;
	modified_by?: number;
	modified_by_user?: User;
	modified_on?: number;

	notification?: Notification;
	topic?: ForumTopic;

	// Filled in when saving a reply.
	reply_to?: number;

	constructor(data: any = {}) {
		super(data);

		if (data.user) {
			this.user = new User(data.user);
		}

		if (data.replied_to) {
			this.replied_to = new User(data.replied_to);
		}

		if (data.modified_by_user) {
			this.modified_by_user = new User(data.modified_by_user);
		}

		if (data.notification) {
			this.notification = new Notification(data.notification);
		}

		if (data.topic) {
			this.topic = new ForumTopic(data.topic);
		}
	}

	static async getPostUrl(postId: number) {
		const response = await Api.sendRequest('/web/forums/posts/get-post-url/' + postId, null, {
			detach: true,
		});

		if (!response || response.error) {
			throw response.error;
		}

		return response.url;
	}

	getPermalink() {
		return Environment.baseUrl + '/x/permalink/forum-post/' + this.id;
	}

	$save() {
		const url = '/web/forums/posts/save/' + this.topic_id;
		let query = '';

		if (this.reply_to) {
			query = '?reply_to=' + this.reply_to;
		}

		if (!this.id) {
			return this.$_save(url + query, 'forumPost');
		} else {
			return this.$_save(url + '/' + this.id + query, 'forumPost');
		}
	}
}

Model.create(ForumPost);
