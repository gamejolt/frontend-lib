import { Model } from '../model/model.service';
import { Environment } from '../environment/environment.service';
import { getProvider } from '../../utils/utils';
import { FiresidePost } from '../fireside/post/post-model';
import { Comment } from '../comment/comment-model';
import { StateService } from 'angular-ui-router';
import { User } from '../user/user.model';
import { Api } from '../api/api.service';
import { Game } from '../game/game.model';

export class Notification extends Model
{
	static TYPE_COMMENT_ADD = 'comment-add';
	static TYPE_COMMENT_ADD_OBJECT_OWNER = 'comment-add-object-owner';
	static TYPE_FORUM_POST_ADD = 'forum-post-add';
	static TYPE_FRIENDSHIP_REQUEST = 'friendship-request';
	static TYPE_FRIENDSHIP_ACCEPT = 'friendship-accept';
	static TYPE_GAME_RATING_ADD = 'game-rating-add';
	static TYPE_GAME_FOLLOW = 'game-follow';
	static TYPE_DEVLOG_POST_ADD = 'devlog-post-add';
	static TYPE_SELLABLE_SELL = 'sellable-sell';

	user_id: number;
	type: string;
	added_on: number;
	viewed_on: number;

	from_resource: string;
	from_resource_id: number;
	from_model: any;

	action_resource: string;
	action_resource_id: number;
	action_model: any;

	to_resource: string;
	to_resource_id: number;
	to_model: any;

	// Generated.
	url: string | undefined = '';
	action_label = '';
	jolticon = '';

	is_user_based = false;
	is_game_based = false;

	// For feeds.
	scroll_id?: string;

	constructor( data: any = {} )
	{
		super( data );

		if ( data.from_resource == 'User' ) {
			this.from_model = new User( data.from_resource_model );
		}

		if ( data.to_resource == 'Game' ) {
			this.to_model = new Game( data.to_resource_model );
		}
		else if ( data.to_resource == 'User' ) {
			this.to_model = new User( data.to_resource_model );
		}
		else if ( data.to_resource == 'Fireside_Post' ) {
			this.to_model = new FiresidePost( data.to_resource_model );
		}
		else if ( data.to_resource == 'Forum_Topic' ) {
			this.to_model = new (getProvider<any>( 'Form_Topic' ))( data.to_resource_model );
		}

		if ( this.type == Notification.TYPE_COMMENT_ADD ) {
			this.action_model = new Comment( data.action_resource_model );
			this.action_label = 'Comment Reply';
			this.url = undefined;  // Must pull asynchronously when they click on the notification.
			this.jolticon = 'jolticon-share';
			this.is_user_based = true;
		}
		else if ( this.type == Notification.TYPE_COMMENT_ADD_OBJECT_OWNER ) {
			this.action_model = new Comment( data.action_resource_model );
			this.action_label = 'New Comment';
			this.url = undefined;  // Must pull asynchronously when they click on the notification.
			this.jolticon = 'jolticon-add-comment';
			this.is_user_based = true;
		}
		else if ( this.type == Notification.TYPE_FORUM_POST_ADD ) {
			this.action_model = new (getProvider<any>( 'Forum_Post' ))( data.action_resource_model );
			this.action_label = 'New Forum Post';
			this.url = undefined;
			this.jolticon = 'jolticon-pencil-box';  // TODO: needs-icon
			this.is_user_based = true;
		}
		else if ( this.type == Notification.TYPE_FRIENDSHIP_REQUEST ) {
			this.action_model = new (getProvider<any>( 'User_Friendship' ))( data.action_resource_model );
			this.action_label = 'Friend Request';
			this.url = getProvider<StateService>( '$state' ).href( 'profile.overview', { username: this.from_model.username } );
			this.jolticon = 'jolticon-friend-add-1';
			this.is_user_based = true;
		}
		else if ( this.type == Notification.TYPE_FRIENDSHIP_ACCEPT ) {
			this.action_model = new (getProvider<any>( 'User_Friendship' ))( data.action_resource_model );
			this.action_label = 'New Friend';
			this.url = getProvider<StateService>( '$state' ).href( 'profile.overview', { username: this.from_model.username } );
			this.jolticon = 'jolticon-friend-add-2';
			this.is_user_based = true;
		}
		else if ( this.type == Notification.TYPE_GAME_RATING_ADD ) {
			this.action_model = new (getProvider<any>( 'Game_Rating' ))( data.action_resource_model );
			this.action_label = 'Game Rating';
			this.url = this.to_model.getUrl();
			this.jolticon = 'jolticon-chart';
			this.is_game_based = true;
		}
		else if ( this.type == Notification.TYPE_GAME_FOLLOW ) {
			this.action_model = new (getProvider<any>( 'GameLibrary_Game' ))( data.action_resource_model );
			this.action_label = 'Game Follow';
			this.url = this.from_model.url;
			this.jolticon = 'jolticon-subscribe';
			this.is_user_based = true;
		}
		else if ( this.type == Notification.TYPE_DEVLOG_POST_ADD ) {
			this.action_model = new FiresidePost( data.action_resource_model );
			this.action_label = 'Devlog Post';
			this.url = getProvider<StateService>( '$state' ).href( 'discover.games.view.devlog.view', {
				slug: this.to_model.slug,
				id: this.to_model.id,
				postSlug: this.action_model.slug,
			} );
			this.jolticon = 'jolticon-blog-article';
			this.is_game_based = true;
		}
		else if ( this.type == Notification.TYPE_SELLABLE_SELL ) {
			this.action_model = new (getProvider<any>( 'Order_Item' ))( data.action_resource_model );
			this.action_label = 'Sale';
			this.url = getProvider<StateService>( '$state' ).href( 'dashboard.main.overview', {} );
			this.jolticon = 'jolticon-heart';
			this.is_user_based = true;
		}

		// Keep memory clean after bootstrapping the models.
		const that: any = this;
		delete that['from_resource_model'];
		delete that['action_resource_model'];
		delete that['to_resource_model'];
	}

	static fetchNotificationsCount()
	{
		return Api.sendRequest( '/web/dash/activity/count', null, { detach: true } );
	}

	async go()
	{
		if ( this.url ) {
			getProvider<ng.ILocationService>( '$location' ).url( this.url.replace( '#!', '' ) );
		}
		// Need to fetch the URL first.
		else if (
			this.type == Notification.TYPE_COMMENT_ADD
			|| this.type == Notification.TYPE_COMMENT_ADD_OBJECT_OWNER
			|| this.type == Notification.TYPE_FORUM_POST_ADD
		) {
			let url: string;

			try {
				if ( this.type == Notification.TYPE_COMMENT_ADD || this.type == Notification.TYPE_COMMENT_ADD_OBJECT_OWNER ) {
					url = await Comment.getCommentUrl( this.action_resource_id );
				}
				else if ( this.type == Notification.TYPE_FORUM_POST_ADD ) {
					url = await getProvider<any>( 'Forum_Post' ).getPostUrl( this.action_resource_id );
				}
				else {
					throw new Error( 'Invalid type.' );
				}

				// If we're going to a URL within this domain, then we want to strip off the domain stuff
				// and go to the URL. Otherwise we need to do a full-page change to the domain/url.
				const search = Environment.baseUrl;
				if ( url.search( search ) === 0 ) {
					url = url.replace( search, '' );
					getProvider<any>( '$location' ).url( url );
				}
				else {
					if ( GJ_IS_CLIENT ) {
						require( 'nw.gui' ).Shell.openExternal( url );
					}
					else {
						window.location.href = url;
					}
				}
			}
			catch ( _e ) {
				getProvider<any>( 'Growls' ).error( 'Could not go to comment.' );
			}
		}

		throw new Error( 'No URL to go to for notification.' );
	}

	$read()
	{
		return this.$_save( '/web/dash/activity/mark-read/' + this.id, 'notification', { detach: true } );
	}
}

Model.create( Notification );
