angular.module( 'gj.Notification' ).factory( 'Notification', function(
	$state, $q, $injector, $location, $window, Model, Api, Environment )
{
	function Notification( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}

		if ( this.subject == 'User' ) {
			this.subject_model = new ($injector.get( 'User' ))( data.subject_model );
		}

		if ( this.object == 'Game' ) {
			this.object_model = new ($injector.get( 'Game' ))( data.object_model );
		}
		else if ( this.object == 'User' ) {
			this.object_model = new ($injector.get( 'User' ))( data.object_model );
		}
		else if ( this.object == 'Fireside_Post' ) {
			this.object_model = new ($injector.get( 'Fireside_Post' ))( data.object_model );
		}

		this.url = '';
		this.action_label = '';
		this.jolticon = '';

		this.is_user_based = false;
		this.is_game_based = false;

		if ( this.type == Notification.TYPE_COMMENT_ADD ) {
			this.action_model = new ($injector.get( 'Comment' ))( data.action_model );
			this.action_label = 'Comment Reply';
			this.url = undefined;  // Must pull asynchronously when they click on the notification.
			this.jolticon = 'jolticon-share';
			this.is_user_based = true;
		}
		else if ( this.type == Notification.TYPE_COMMENT_ADD_OBJECT_OWNER ) {
			this.action_model = new ($injector.get( 'Comment' ))( data.action_model );
			this.action_label = 'New Comment';
			this.url = undefined;  // Must pull asynchronously when they click on the notification.
			this.jolticon = 'jolticon-add-comment';
			this.is_user_based = true;
		}
		else if ( this.type == Notification.TYPE_FORUM_POST_ADD ) {
			this.action_model = new ($injector.get( 'Forum_Post' ))( data.action_model );
			this.action_label = 'New Forum Post';
			this.url = undefined;
			this.jolticon = 'jolticon-pencil-box';  // TODO: needs-icon
			this.is_user_based = true;
		}
		else if ( this.type == Notification.TYPE_FRIENDSHIP_REQUEST ) {
			this.action_model = new ($injector.get( 'User_Friendship' ))( data.action_model );
			this.action_label = 'Friend Request';
			this.url = $state.href( 'profile.overview', { slug: this.subject_model.slug, id: this.subject_model.id } );
			this.jolticon = 'jolticon-friend-add-1';
			this.is_user_based = true;
		}
		else if ( this.type == Notification.TYPE_FRIENDSHIP_ACCEPT ) {
			this.action_model = new ($injector.get( 'User_Friendship' ))( data.action_model );
			this.action_label = 'New Friend';
			this.url = $state.href( 'profile.overview', { slug: this.subject_model.slug, id: this.subject_model.id } );
			this.jolticon = 'jolticon-friend-add-2';
			this.is_user_based = true;
		}
		else if ( this.type == Notification.TYPE_GAME_RATING_ADD ) {
			this.action_model = new ($injector.get( 'Game_Rating' ))( data.action_model );
			this.action_label = 'Game Rating';
			this.url = this.object_model.getUrl();
			this.jolticon = 'jolticon-chart';
			this.is_game_based = true;
		}
		else if ( this.type == Notification.TYPE_GAME_FOLLOW ) {
			this.action_model = new ($injector.get( 'GameLibrary_Game' ))( data.action_model );
			this.action_label = 'Game Follow';
			this.url = this.subject_model.url;
			this.jolticon = 'jolticon-subscribe';
			this.is_user_based = true;
		}
		else if ( this.type == Notification.TYPE_GAME_NEWS_ADD ) {
			this.action_model = new ($injector.get( 'Game_NewsArticle' ))( data.action_model );
			this.action_label = 'News Update';
			this.url = $state.href( 'discover.games.view.news.view', {
				slug: this.object_model.slug,
				id: this.object_model.id,
				articleSlug: this.action_model.slug,
				articleId: this.action_model.id,
			} );
			this.jolticon = 'jolticon-blog-article';
			this.is_game_based = true;
		}
		else if ( this.type == Notification.TYPE_SELLABLE_SELL ) {
			this.action_model = new ($injector.get( 'Order_Item' ))( data.action_model );
			this.action_label = 'Sale';
			this.url = $state.href( 'dashboard.main.overview' );
			this.jolticon = 'jolticon-heart';
			this.is_user_based = true;
		}
	}

	Notification.TYPE_COMMENT_ADD = 'comment-add';
	Notification.TYPE_COMMENT_ADD_OBJECT_OWNER = 'comment-add-object-owner';
	Notification.TYPE_FORUM_POST_ADD = 'forum-post-add';
	Notification.TYPE_FRIENDSHIP_REQUEST = 'friendship-request';
	Notification.TYPE_FRIENDSHIP_ACCEPT = 'friendship-accept';
	Notification.TYPE_GAME_RATING_ADD = 'game-rating-add';
	Notification.TYPE_GAME_FOLLOW = 'game-follow';
	Notification.TYPE_GAME_NEWS_ADD = 'game-news-add';
	Notification.TYPE_SELLABLE_SELL = 'sellable-sell';

	Notification.fetchNotificationsFeed = function()
	{
		return Api.sendRequest( '/web/dash/activity/notifications-feed', null, { detach: true } ).then( function( response )
		{
			return {
				notifications: Notification.populate( response.notifications ),
				notificationsCount: response.notificationsCount || 0,
			};
		} );
	};

	Notification.fetchNotificationsCount = function()
	{
		return Api.sendRequest( '/web/dash/activity/notifications-count', null, { detach: true } );
	};

	Notification.$readAll = function( type )
	{
		if ( type ) {
			type = '/' + type;
		}
		else {
			type = '';
		}

		return Api.sendRequest( '/web/dash/activity/mark-all-read' + type, {} ).then( function( response )
		{
			if ( !response.success ) {
				return $q.reject( response );
			}

			return response;
		} );
	};

	Notification.prototype.go = function()
	{
		if ( this.url ) {
			$location.url( this.url.replace( '#!', '' ) );
		}
		// Need to fetch the URL first.
		else if (
			this.type == Notification.TYPE_COMMENT_ADD
			|| this.type == Notification.TYPE_COMMENT_ADD_OBJECT_OWNER
			|| this.type == Notification.TYPE_FORUM_POST_ADD
		) {
			var promise = null;
			if ( this.type == Notification.TYPE_COMMENT_ADD || this.type == Notification.TYPE_COMMENT_ADD_OBJECT_OWNER ) {
				promise = $injector.get( 'Comment' ).getCommentUrl( this.action_id );
			}
			else if ( this.type == Notification.TYPE_FORUM_POST_ADD ) {
				promise = $injector.get( 'Forum_Post' ).getPostUrl( this.action_id );
			}

			promise.then( function( url )
			{
				// If we're going to a URL within this domain, then we want to strip off the domain stuff
				// and go to the URL. Otherwise we need to do a full-page change to the domain/url.
				var search = Environment.baseUrl;
				if ( url.search( search ) === 0 ) {
					url = url.replace( search, '' );
					$location.url( url );
				}
				else {
					if ( Environment.isClient ) {
						require( 'nw.gui' ).Shell.openExternal( url );
					}
					else {
						$window.location = url;
					}
				}
			} )
			.catch( function()
			{
				$injector.get( 'Growls' ).error( 'Could not go to comment.' );
			} );
		}
		else {
			throw new Error( 'No URL to go to for notification.' );
		}
	};

	Notification.prototype.$read = function()
	{
		return this.$_save( '/web/dash/activity/mark-read/' + this.id, 'notification', { detach: true } );
	};

	return Model.create( Notification );
} );
