angular.module( 'gj.Forum.Topic' ).factory( 'Forum_Topic', function( Api, Model, User, Forum_Post )
{
	function Forum_Topic( data )
	{
		if ( data ) {
			angular.extend( this, data );

			if ( data.user ) {
				this.user = new User( data.user );
			}

			if ( data.main_post ) {
				this.main_post = new Forum_Post( data.main_post );
			}

			if ( data.latest_post ) {
				this.latest_post = new Forum_Post( data.latest_post );
			}
		}
	}

	Forum_Topic.STATUS_ACTIVE = 'active';
	Forum_Topic.STATUS_SPAM = 'spam';
	Forum_Topic.STATUS_REMOVED = 'removed';

	Forum_Topic.prototype.$save = function()
	{
		var url = '/web/forums/topics/save/' + this.channel_id;

		if ( !this.id ) {
			return this.$_save( url, 'forumTopic' );
		}
		else {
			return this.$_save( url + '/' + this.id, 'forumTopic' );
		}
	};

	Forum_Topic.prototype.$follow = function()
	{
		// Force POST
		return Api.sendRequest( '/web/forums/topics/follow/' + this.id, {} );
	};

	Forum_Topic.prototype.$unfollow = function()
	{
		// Force POST
		return Api.sendRequest( '/web/forums/topics/unfollow/' + this.id, {} );
	};

	return Model.create( Forum_Topic );
} );
