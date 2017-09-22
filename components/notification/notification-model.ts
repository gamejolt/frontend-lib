import * as nwGui from 'nw.gui';

import VueRouter from 'vue-router';
import { Model } from '../model/model.service';
import { Environment } from '../environment/environment.service';
import { FiresidePost } from '../fireside/post/post-model';
import { Comment } from '../comment/comment-model';
import { User } from '../user/user.model';
import { Api } from '../api/api.service';
import { Game } from '../game/game.model';
import { Growls } from '../growls/growls.service';
import { ForumTopic } from '../forum/topic/topic.model';
import { ForumPost } from '../forum/post/post.model';
import { UserFriendship } from '../user/friendship/friendship.model';
import { GameRating } from '../game/rating/rating.model';
import { Sellable } from '../sellable/sellable.model';
import { Translate } from '../translate/translate.service';
import { OrderItem } from '../order/item/item.model';
import { GameLibraryGame } from '../game-library/game/game.model';
import { Subscription } from '../subscription/subscription.model';

export class Notification extends Model {
	static TYPE_COMMENT_ADD = 'comment-add';
	static TYPE_COMMENT_ADD_OBJECT_OWNER = 'comment-add-object-owner';
	static TYPE_FORUM_POST_ADD = 'forum-post-add';
	static TYPE_FRIENDSHIP_REQUEST = 'friendship-request';
	static TYPE_FRIENDSHIP_ACCEPT = 'friendship-accept';
	static TYPE_GAME_RATING_ADD = 'game-rating-add';
	static TYPE_GAME_FOLLOW = 'game-follow';
	static TYPE_DEVLOG_POST_ADD = 'devlog-post-add';
	static TYPE_SELLABLE_SELL = 'sellable-sell';
	static TYPE_USER_FOLLOW = 'user-follow';

	user_id: number;
	type: string;
	added_on: number;
	viewed_on: number;

	from_resource: string;
	from_resource_id: number;
	from_model?: User;

	action_resource: string;
	action_resource_id: number;
	action_model:
		| Comment
		| ForumPost
		| UserFriendship
		| GameRating
		| GameLibraryGame
		| FiresidePost
		| OrderItem
		| Subscription;

	to_resource: string;
	to_resource_id: number;
	to_model: Game | User | FiresidePost | ForumTopic | Sellable;

	// Generated in constructor.
	jolticon = '';
	is_user_based = false;
	is_game_based = false;

	// For feeds.
	scroll_id?: string;

	constructor(data: any = {}) {
		super(data);

		if (data.from_resource === 'User' && data.from_resource_id) {
			this.from_model = new User(data.from_resource_model);
		}

		if (data.to_resource === 'Game') {
			this.to_model = new Game(data.to_resource_model);
		} else if (data.to_resource === 'User') {
			this.to_model = new User(data.to_resource_model);
		} else if (data.to_resource === 'Fireside_Post') {
			this.to_model = new FiresidePost(data.to_resource_model);
		} else if (data.to_resource === 'Forum_Topic') {
			this.to_model = new ForumTopic(data.to_resource_model);
		} else if (data.to_resource === 'Sellable') {
			this.to_model = new Sellable(data.to_resource_model);
		}

		if (this.type === Notification.TYPE_COMMENT_ADD) {
			this.action_model = new Comment(data.action_resource_model);
			this.jolticon = 'jolticon-share';
			this.is_user_based = true;
		} else if (this.type === Notification.TYPE_COMMENT_ADD_OBJECT_OWNER) {
			this.action_model = new Comment(data.action_resource_model);
			this.jolticon = 'jolticon-add-comment';
			this.is_user_based = true;
		} else if (this.type === Notification.TYPE_FORUM_POST_ADD) {
			this.action_model = new ForumPost(data.action_resource_model);
			this.jolticon = 'jolticon-pencil-box'; // TODO: needs-icon
			this.is_user_based = true;
		} else if (this.type === Notification.TYPE_FRIENDSHIP_REQUEST) {
			this.action_model = new UserFriendship(data.action_resource_model);
			this.jolticon = 'jolticon-friend-add-1';
			this.is_user_based = true;
		} else if (this.type === Notification.TYPE_FRIENDSHIP_ACCEPT) {
			this.action_model = new UserFriendship(data.action_resource_model);
			this.jolticon = 'jolticon-friend-add-2';
			this.is_user_based = true;
		} else if (this.type === Notification.TYPE_GAME_RATING_ADD) {
			this.action_model = new GameRating(data.action_resource_model);
			this.jolticon = 'jolticon-chart';
			this.is_game_based = true;
		} else if (this.type === Notification.TYPE_GAME_FOLLOW) {
			this.action_model = new GameLibraryGame(data.action_resource_model);
			this.jolticon = 'jolticon-subscribe';
			this.is_user_based = true;
		} else if (this.type === Notification.TYPE_DEVLOG_POST_ADD) {
			this.action_model = new FiresidePost(data.action_resource_model);
			this.jolticon = 'jolticon-blog-article';
			this.is_game_based = true;
		} else if (this.type === Notification.TYPE_SELLABLE_SELL) {
			this.action_model = new OrderItem(data.action_resource_model);
			this.jolticon = 'jolticon-heart';
			this.is_user_based = true;
		} else if (this.type === Notification.TYPE_USER_FOLLOW) {
			this.action_model = new Subscription(data.action_resource_model);
			this.jolticon = 'jolticon-subscribe';
			this.is_user_based = true;
		}

		// Keep memory clean after bootstrapping the models.
		const that: any = this;
		delete that['from_resource_model'];
		delete that['action_resource_model'];
		delete that['to_resource_model'];
	}

	static fetchNotificationsCount() {
		return Api.sendRequest('/web/dash/activity/count', null, { detach: true });
	}

	get routeLocation() {
		switch (this.type) {
			case Notification.TYPE_FRIENDSHIP_REQUEST:
			case Notification.TYPE_FRIENDSHIP_ACCEPT:
				return this.from_model!.url;

			case Notification.TYPE_USER_FOLLOW:
				return this.from_model!.url;

			case Notification.TYPE_GAME_RATING_ADD:
				return (this.to_model as Game).routeLocation;

			case Notification.TYPE_GAME_FOLLOW:
				return this.from_model!.url;

			case Notification.TYPE_DEVLOG_POST_ADD:
				return {
					name: 'discover.games.view.devlog.view',
					params: {
						slug: (this.to_model as Game).slug,
						id: this.to_model.id + '',
						postSlug: (this.action_model as FiresidePost).slug,
					},
				};

			case Notification.TYPE_SELLABLE_SELL:
				return {
					name: 'dash.main.overview',
				};
		}

		// Must pull asynchronously when they click on the notification.
		return '';
	}

	async go(router: VueRouter) {
		if (this.routeLocation) {
			router.push(this.routeLocation);
		} else if (
			this.type === Notification.TYPE_COMMENT_ADD ||
			this.type === Notification.TYPE_COMMENT_ADD_OBJECT_OWNER ||
			this.type === Notification.TYPE_FORUM_POST_ADD
		) {
			// Need to fetch the URL first.
			let url: string;

			try {
				if (
					this.type === Notification.TYPE_COMMENT_ADD ||
					this.type === Notification.TYPE_COMMENT_ADD_OBJECT_OWNER
				) {
					url = await Comment.getCommentUrl(this.action_resource_id);
				} else if (this.type === Notification.TYPE_FORUM_POST_ADD) {
					url = await ForumPost.getPostUrl(this.action_resource_id);
				} else {
					throw new Error('Invalid type.');
				}

				console.log('got', url);

				// If we're going to a URL within this domain, then we want to strip off the domain stuff
				// and go to the URL. Otherwise we need to do a full-page change to the domain/url.
				const search = Environment.baseUrl;
				console.log('search', search);
				if (url.search(search) === 0) {
					url = url.replace(search, '');
					router.push(url);
				} else if (GJ_IS_CLIENT) {
					const gui = require('nw.gui') as typeof nwGui;
					gui.Shell.openExternal(url);
				} else {
					window.location.href = url;
				}
			} catch (e) {
				console.error(e);
				Growls.error(Translate.$gettext(`Couldn't go to notification.`));
			}
		}
	}

	$read() {
		return this.$_save('/web/dash/activity/mark-read/' + this.id, 'notification', { detach: true });
	}
}

Model.create(Notification);
