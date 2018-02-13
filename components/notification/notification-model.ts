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
import { GameCollaborator } from '../game/collaborator/collaborator.model';
import { Mention } from '../mention/mention.model';
import { assertNever } from '../../utils/utils';
import { currency } from '../../vue/filters/currency';

function getRouteLocationForModel(model: Game | User | FiresidePost) {
	if (model instanceof User) {
		return model.url;
	} else if (model instanceof Game) {
		return model.routeLocation;
	} else if (model instanceof FiresidePost && !!model.game) {
		return {
			name: 'discover.games.view.devlog.view',
			params: {
				slug: model.game.slug,
				id: model.game.id + '',
				postSlug: model.slug,
			},
		};
	}
	return '';
}

export class Notification extends Model {
	static TYPE_COMMENT_ADD = 'comment-add';
	static TYPE_COMMENT_ADD_OBJECT_OWNER = 'comment-add-object-owner';
	static TYPE_FORUM_POST_ADD = 'forum-post-add';
	static TYPE_FRIENDSHIP_REQUEST = 'friendship-request';
	static TYPE_FRIENDSHIP_ACCEPT = 'friendship-accept';
	static TYPE_FRIENDSHIP_CANCEL = 'friendship-cancel';
	static TYPE_GAME_RATING_ADD = 'game-rating-add';
	static TYPE_GAME_FOLLOW = 'game-follow';
	static TYPE_DEVLOG_POST_ADD = 'devlog-post-add';
	static TYPE_SELLABLE_SELL = 'sellable-sell';
	static TYPE_USER_FOLLOW = 'user-follow';
	static TYPE_COLLABORATOR_INVITE = 'collaborator-invite';
	static TYPE_MENTION = 'mention';

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
		| Subscription
		| GameCollaborator
		| Mention;

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
		} else if (this.type === Notification.TYPE_COLLABORATOR_INVITE) {
			this.action_model = new GameCollaborator(data.action_resource_model);
			this.jolticon = 'jolticon-wrench';
			this.is_user_based = true;
		} else if (this.type === Notification.TYPE_MENTION) {
			this.action_model = new Mention(data.action_resource_model);
			this.jolticon = 'jolticon-comment';
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
				return getRouteLocationForModel(this.from_model!);

			case Notification.TYPE_USER_FOLLOW:
				return getRouteLocationForModel(this.from_model!);

			case Notification.TYPE_GAME_RATING_ADD:
				return getRouteLocationForModel(this.to_model as Game);

			case Notification.TYPE_GAME_FOLLOW:
				return getRouteLocationForModel(this.from_model!);

			case Notification.TYPE_COLLABORATOR_INVITE:
				return getRouteLocationForModel(this.to_model as Game);

			case Notification.TYPE_DEVLOG_POST_ADD:
				return getRouteLocationForModel(this.action_model as FiresidePost);

			case Notification.TYPE_SELLABLE_SELL:
				return {
					name: 'dash.main.overview',
				};

			case Notification.TYPE_MENTION: {
				const mention = this.action_model as Mention;
				switch (mention.resource) {
					case 'Comment':
					case 'Forum_Post':
						// Pull through the "go" func below since we can't statically get it.
						return '';

					case 'Game':
						return getRouteLocationForModel(this.to_model as Game);

					case 'User':
						return getRouteLocationForModel(this.to_model as User);

					case 'Fireside_Post':
						return getRouteLocationForModel(this.to_model as FiresidePost);

					default:
						return assertNever(mention.resource);
				}
			}
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
			this.type === Notification.TYPE_MENTION ||
			this.type === Notification.TYPE_FORUM_POST_ADD
		) {
			// Need to fetch the URL first.
			let url: string;
			let model = this.action_model;

			if (this.action_model instanceof Mention) {
				if (this.action_model.comment) {
					model = this.action_model.comment;
				} else if (this.action_model.forum_post) {
					model = this.action_model.forum_post;
				} else {
					throw new Error(`Invalid mention model.`);
				}
			}

			try {
				if (model instanceof Comment) {
					url = await Comment.getCommentUrl(model.id);
				} else if (model instanceof ForumPost) {
					url = await ForumPost.getPostUrl(model.id);
				} else {
					throw new Error('Invalid type.');
				}

				// If we're going to a URL within this domain, then we want to strip off the domain stuff
				// and go to the URL. Otherwise we need to do a full-page change to the domain/url.
				const search = Environment.baseUrl;
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
		return this.$_save('/web/dash/activity/mark-read/' + this.id, 'notification', {
			detach: true,
		});
	}
}

Model.create(Notification);

function getSubjectTranslationValue(notification: Notification) {
	if (notification.is_user_based) {
		if (notification.from_model) {
			return (
				notification.from_model.display_name +
				' (@' +
				notification.from_model.username +
				')'
			);
		} else {
			return 'Someone';
		}
	} else if (notification.is_game_based && notification.to_model instanceof Game) {
		return notification.to_model.title;
	}
	return '';
}

function getTranslationValues(notification: Notification) {
	const subject = getSubjectTranslationValue(notification);

	if (
		notification.to_model instanceof Game ||
		notification.to_model instanceof ForumTopic ||
		notification.to_model instanceof FiresidePost
	) {
		return {
			subject: subject,
			object: notification.to_model.title,
		};
	}

	return {
		subject: subject,
	};
}

export function getNotificationText(notification: Notification) {
	switch (notification.type) {
		case Notification.TYPE_DEVLOG_POST_ADD: {
			let gameTitle = '';
			let postTitle = '';
			if (notification.to_model instanceof Game) {
				gameTitle = notification.to_model.title;
			}
			if (notification.action_model instanceof FiresidePost) {
				postTitle = notification.action_model.title;
			}
			return `${gameTitle} - ${postTitle}`;
		}

		case Notification.TYPE_COMMENT_ADD_OBJECT_OWNER: {
			return Translate.$gettextInterpolate(
				`%{ subject } commented on %{ object }.`,
				getTranslationValues(notification)
			);
		}

		case Notification.TYPE_COMMENT_ADD: {
			return Translate.$gettextInterpolate(
				`%{ subject } replied to your comment on %{ object }.`,
				getTranslationValues(notification)
			);
		}

		case Notification.TYPE_FORUM_POST_ADD: {
			return Translate.$gettextInterpolate(
				`%{ subject } posted a new forum post to %{ object }.`,
				getTranslationValues(notification)
			);
		}

		case Notification.TYPE_FRIENDSHIP_REQUEST: {
			return Translate.$gettextInterpolate(
				`%{ subject } sent you a friend request.`,
				getTranslationValues(notification)
			);
		}

		case Notification.TYPE_FRIENDSHIP_ACCEPT: {
			return Translate.$gettextInterpolate(
				`%{ subject } accepted your friend request.`,
				getTranslationValues(notification)
			);
		}

		case Notification.TYPE_GAME_RATING_ADD: {
			return Translate.$gettextInterpolate(
				`%{ subject } received a new rating.`,
				getTranslationValues(notification)
			);
		}

		case Notification.TYPE_GAME_FOLLOW: {
			return Translate.$gettextInterpolate(
				`%{ subject } followed %{ object }.`,
				getTranslationValues(notification)
			);
		}

		case Notification.TYPE_SELLABLE_SELL: {
			const sellable = notification.to_model as Sellable;
			const orderItem = notification.action_model as OrderItem;
			const translationValues = {
				object: sellable.title,
				amount: currency(orderItem.amount),
				subject: getSubjectTranslationValue(notification),
			};

			return Translate.$gettextInterpolate(
				`%{ subject } bought a package in %{ object } for %{ amount }.`,
				translationValues
			);
		}

		case Notification.TYPE_USER_FOLLOW: {
			return Translate.$gettextInterpolate(
				`%{ subject } followed you.`,
				getTranslationValues(notification)
			);
		}

		case Notification.TYPE_COLLABORATOR_INVITE: {
			return Translate.$gettextInterpolate(
				`%{ subject } invited you to collaborate on %{ object }.`,
				getTranslationValues(notification)
			);
		}

		case Notification.TYPE_MENTION: {
			const mention = notification.action_model as Mention;

			switch (mention.resource) {
				case 'Comment': {
					if (notification.to_model instanceof Game) {
						return Translate.$gettextInterpolate(
							`%{ subject } mentioned you in a comment on the game %{ object }.`,
							{
								object: notification.to_model.title,
								subject: getSubjectTranslationValue(notification),
							}
						);
					} else if (notification.to_model instanceof FiresidePost) {
						return Translate.$gettextInterpolate(
							`%{ subject } mentioned you in a comment on the post %{ object }.`,
							{
								object: notification.to_model.title,
								subject: getSubjectTranslationValue(notification),
							}
						);
					}
					break;
				}

				case 'Game': {
					return Translate.$gettextInterpolate(
						`%{ subject } mentioned you in the game %{ object }.`,
						{
							object: (notification.to_model as Game).title,
							subject: getSubjectTranslationValue(notification),
						}
					);
				}

				case 'User': {
					return Translate.$gettextInterpolate(
						`%{ subject } mentioned you in their user bio.`,
						getTranslationValues(notification)
					);
				}

				case 'Fireside_Post': {
					return Translate.$gettextInterpolate(
						`%{ subject } mentioned you in the post %{ object }.`,
						{
							object: (notification.to_model as FiresidePost).title,
							subject: getSubjectTranslationValue(notification),
						}
					);
				}

				case 'Forum_Post': {
					return Translate.$gettextInterpolate(
						`%{ subject } mentioned you in a forum post to %{ object }.`,
						{
							object: (notification.to_model as ForumTopic).title,
							subject: getSubjectTranslationValue(notification),
						}
					);
				}

				default: {
					return assertNever(mention.resource);
				}
			}
		}
	}
}
