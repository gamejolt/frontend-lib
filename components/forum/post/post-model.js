angular.module( 'gj.Forum.Post' ).factory( 'Forum_Post', function( $q, $injector, Api, Environment, Model, User, Notification )
{
	function Forum_Post( data )
	{
		if ( data ) {
			angular.extend( this, data );

			if ( data.user ) {
				this.user = new User( data.user );
			}

			if ( data.replied_to ) {
				this.replied_to = new User( data.replied_to );
			}

			if ( data.modified_by_user ) {
				this.modified_by_user = new User( data.modified_by_user );
			}

			if ( data.notification ) {
				this.notification = new Notification( data.notification );
			}

			if ( data.topic ) {
				var Forum_Topic = $injector.get( 'Forum_Topic' );
				this.topic = new Forum_Topic( data.topic );
			}
		}
	}

	Forum_Post.STATUS_ACTIVE = 'active';
	Forum_Post.STATUS_SPAM = 'spam';
	Forum_Post.STATUS_REMOVED = 'removed';

	Forum_Post.prototype.getPermalink = function()
	{
		return Environment.baseUrl + '/x/permalink/forum-post/' + this.id;
	};

	Forum_Post.getPostUrl = function( postId )
	{
		return Api.sendRequest( '/web/forums/posts/get-post-url/' + postId, null, { detach: true } ).then( function( response )
		{
			if ( !response || response.error ) {
				return $q.reject( response.error );
			}

			return response.url;
		} );
	};

	Forum_Post.prototype.$save = function()
	{
		var url = '/web/forums/posts/save/' + this.topic_id;
		var query = '';

		if ( this.reply_to ) {
			query = '?reply_to=' + this.reply_to;
		}

		if ( !this.id ) {
			return this.$_save( url + query, 'forumPost' );
		}
		else {
			return this.$_save( url + '/' + this.id + query, 'forumPost' );
		}
	};

	return Model.create( Forum_Post );
} );
