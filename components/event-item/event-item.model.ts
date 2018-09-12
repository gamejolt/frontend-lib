import { Model } from '../model/model.service';
import { User } from '../user/user.model';
import { Comment } from '../comment/comment-model';
import { CommentVideo } from '../comment/video/video-model';
import { Game } from '../game/game.model';
import { FiresidePost } from '../fireside/post/post-model';

export class EventItem extends Model {
	static readonly TYPE_COMMENT_VIDEO_ADD = 'comment-video-add';
	static readonly TYPE_GAME_PUBLISH = 'game-publish';
	static readonly TYPE_POST_ADD = 'post-add';

	type: 'comment-video-add' | 'game-publish' | 'post-add';
	added_on: number;
	from?: User;
	action: any;
	to: any;

	// For feeds.
	scroll_id?: string;

	constructor(data: any = {}) {
		// Don't auto assign data. We pull what we want.
		super();

		this.type = data.type;
		this.added_on = data.added_on;
		this.scroll_id = data.scroll_id;

		if (this.type === EventItem.TYPE_COMMENT_VIDEO_ADD) {
			this.action = new CommentVideo(data.action_resource_model);
			this.from = new User(data.from_resource_model);
			this.to = new Comment(data.to_resource_model);
		} else if (this.type === EventItem.TYPE_GAME_PUBLISH) {
			this.action = new Game(data.action_resource_model);
			this.from = new User(data.from_resource_model);
		} else if (this.type === EventItem.TYPE_POST_ADD) {
			this.action = new FiresidePost(data.action_resource_model);
			this.from = new User(data.from_resource_model);
			this.to =
				data.to_resource === 'Game'
					? new Game(data.to_resource_model)
					: new User(data.to_resource_model);
		}
	}

	set game(game: Game | undefined) {
		if (game) {
			if (this.type === EventItem.TYPE_GAME_PUBLISH) {
				this.action = game;
			} else if (this.type === EventItem.TYPE_POST_ADD && this.to instanceof Game) {
				this.to = game;
			} else if (this.type === EventItem.TYPE_COMMENT_VIDEO_ADD) {
				(this.action as CommentVideo).game = game;
			}
		}
	}

	get game() {
		if (this.type === EventItem.TYPE_GAME_PUBLISH) {
			return this.action as Game;
		} else if (this.type === EventItem.TYPE_POST_ADD && this.to instanceof Game) {
			return this.to;
		} else if (this.type === EventItem.TYPE_COMMENT_VIDEO_ADD) {
			return (this.action as CommentVideo).game;
		}
	}
}

Model.create(EventItem);
