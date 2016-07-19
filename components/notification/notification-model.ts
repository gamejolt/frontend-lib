import { Injectable } from 'ng-metadata/core';
import { Model } from './../model/model-service';

export function NotificationFactory( Model, Api, $state, $q, $injector, $location, $window, Environment )
{
	return Model.create( Notification, {
		Api,
		$state,
		$q,
		$injector,
		$location,
		$window,
		Environment,
	} );
}

@Injectable()
export class Notification extends Model
{
	static Api: any;
	static Environment: any;
	static $state: angular.ui.IStateService;
	static $q: angular.IQService;
	static $injector: any;
	static $location: angular.ILocationService;
	static $window: angular.IWindowService;

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
	url = '';
	action_label = '';
	jolticon = '';

	is_user_based = false;
	is_game_based = false;

	constructor( data?: any )
	{
		super( data );

		if ( data ) {

			if ( data.from_resource == 'User' ) {
				this.from_model = new (Notification.$injector.get( 'User' ))( data.from_resource_model );
			}

			if ( data.to_resource == 'Game' ) {
				this.to_model = new (Notification.$injector.get( 'Game' ))( data.to_resource_model );
			}
			else if ( data.to_resource == 'User' ) {
				this.to_model = new (Notification.$injector.get( 'User' ))( data.to_resource_model );
			}
			else if ( data.to_resource == 'Fireside_Post' ) {
				this.to_model = new (Notification.$injector.get( 'Fireside_Post' ))( data.to_resource_model );
			}

			if ( this.type == Notification.TYPE_COMMENT_ADD ) {
				this.action_model = new (Notification.$injector.get( 'Comment' ))( data.action_resource_model );
				this.action_label = 'Comment Reply';
				this.url = undefined;  // Must pull asynchronously when they click on the notification.
				this.jolticon = 'jolticon-share';
				this.is_user_based = true;
			}
			else if ( this.type == Notification.TYPE_COMMENT_ADD_OBJECT_OWNER ) {
				this.action_model = new (Notification.$injector.get( 'Comment' ))( data.action_resource_model );
				this.action_label = 'New Comment';
				this.url = undefined;  // Must pull asynchronously when they click on the notification.
				this.jolticon = 'jolticon-add-comment';
				this.is_user_based = true;
			}
			else if ( this.type == Notification.TYPE_FORUM_POST_ADD ) {
				this.action_model = new (Notification.$injector.get( 'Forum_Post' ))( data.action_resource_model );
				this.action_label = 'New Forum Post';
				this.url = undefined;
				this.jolticon = 'jolticon-pencil-box';  // TODO: needs-icon
				this.is_user_based = true;
			}
			else if ( this.type == Notification.TYPE_FRIENDSHIP_REQUEST ) {
				this.action_model = new (Notification.$injector.get( 'User_Friendship' ))( data.action_resource_model );
				this.action_label = 'Friend Request';
				this.url = Notification.$state.href( 'profile.overview', { slug: this.from_model.slug, id: this.from_model.id } );
				this.jolticon = 'jolticon-friend-add-1';
				this.is_user_based = true;
			}
			else if ( this.type == Notification.TYPE_FRIENDSHIP_ACCEPT ) {
				this.action_model = new (Notification.$injector.get( 'User_Friendship' ))( data.action_resource_model );
				this.action_label = 'New Friend';
				this.url = Notification.$state.href( 'profile.overview', { slug: this.from_model.slug, id: this.from_model.id } );
				this.jolticon = 'jolticon-friend-add-2';
				this.is_user_based = true;
			}
			else if ( this.type == Notification.TYPE_GAME_RATING_ADD ) {
				this.action_model = new (Notification.$injector.get( 'Game_Rating' ))( data.action_resource_model );
				this.action_label = 'Game Rating';
				this.url = this.to_model.getUrl();
				this.jolticon = 'jolticon-chart';
				this.is_game_based = true;
			}
			else if ( this.type == Notification.TYPE_GAME_FOLLOW ) {
				this.action_model = new (Notification.$injector.get( 'GameLibrary_Game' ))( data.action_resource_model );
				this.action_label = 'Game Follow';
				this.url = this.from_model.url;
				this.jolticon = 'jolticon-subscribe';
				this.is_user_based = true;
			}
			else if ( this.type == Notification.TYPE_DEVLOG_POST_ADD ) {
				this.action_model = new (Notification.$injector.get( 'Fireside_Post' ))( data.action_resource_model );
				this.action_label = 'Devlog Post';
				// this.url = Notification.$state.href( 'discover.games.view.news.view', {
				// 	slug: this.to_model.slug,
				// 	id: this.to_model.id,
				// 	articleSlug: this.action_model.slug,
				// 	articleId: this.action_model.id,
				// } );
				this.jolticon = 'jolticon-blog-article';
				this.is_game_based = true;
			}
			else if ( this.type == Notification.TYPE_SELLABLE_SELL ) {
				this.action_model = new (Notification.$injector.get( 'Order_Item' ))( data.action_resource_model );
				this.action_label = 'Sale';
				this.url = Notification.$state.href( 'dashboard.main.overview' );
				this.jolticon = 'jolticon-heart';
				this.is_user_based = true;
			}
		}

		// Keep memory clean after bootstrapping the models.
		delete this['from_resource_model'];
		delete this['action_resource_model'];
		delete this['to_resource_model'];
	}

	static fetchNotificationsFeed()
	{
		return Notification.Api.sendRequest( '/web/dash/activity/notifications-feed', null, { detach: true } )
			.then( response =>
			{
				return {
					notifications: Notification.populate( response.notifications ),
					notificationsCount: response.notificationsCount || 0,
				};
			} );
	}

	static fetchNotificationsCount()
	{
		return Notification.Api.sendRequest( '/web/dash/activity/notifications-count', null, { detach: true } );
	}

	// static $readAll( type: string )
	// {
	// 	if ( type ) {
	// 		type = '/' + type;
	// 	}
	// 	else {
	// 		type = '';
	// 	}

	// 	return Notification.Api.sendRequest( '/web/dash/activity/mark-all-read' + type, {} )
	// 		.then( response =>
	// 		{
	// 			if ( !response.success ) {
	// 				return Notification.$q.reject( response );
	// 			}

	// 			return response;
	// 		} );
	// }

	go()
	{
		if ( this.url ) {
			Notification.$location.url( this.url.replace( '#!', '' ) );
		}
		// Need to fetch the URL first.
		else if (
			this.type == Notification.TYPE_COMMENT_ADD
			|| this.type == Notification.TYPE_COMMENT_ADD_OBJECT_OWNER
			|| this.type == Notification.TYPE_FORUM_POST_ADD
		) {
			let promise = null;
			if ( this.type == Notification.TYPE_COMMENT_ADD || this.type == Notification.TYPE_COMMENT_ADD_OBJECT_OWNER ) {
				promise = Notification.$injector.get( 'Comment' ).getCommentUrl( this.action_resource_id );
			}
			else if ( this.type == Notification.TYPE_FORUM_POST_ADD ) {
				promise = Notification.$injector.get( 'Forum_Post' ).getPostUrl( this.action_resource_id );
			}

			promise.then( url =>
			{
				// If we're going to a URL within this domain, then we want to strip off the domain stuff
				// and go to the URL. Otherwise we need to do a full-page change to the domain/url.
				const search = Notification.Environment.baseUrl;
				if ( url.search( search ) === 0 ) {
					url = url.replace( search, '' );
					Notification.$location.url( url );
				}
				else {
					if ( Notification.Environment.isClient ) {
						require( 'nw.gui' ).Shell.openExternal( url );
					}
					else {
						Notification.$window.location = url;
					}
				}
			} )
			.catch( () =>
			{
				Notification.$injector.get( 'Growls' ).error( 'Could not go to comment.' );
			} );
		}
		else {
			throw new Error( 'No URL to go to for notification.' );
		}
	}

	$read()
	{
		return this.$_save( '/web/dash/activity/mark-read/' + this.id, 'notification', { detach: true } );
	}
}
