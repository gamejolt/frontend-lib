angular.module( 'gj.User.Friendship' ).factory( 'User_Friendship', function( Model, Api, User )
{
	function User_Friendship( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}

		if ( this.user ) {
			this.user = new User( this.user );
		}

		if ( this.target_user ) {
			this.target_user = new User( this.target_user );
		}
	}

	User_Friendship.STATE_NONE = 0;
	User_Friendship.STATE_REQUEST_SENT = 1;
	User_Friendship.STATE_REQUEST_RECEIVED = 2;
	User_Friendship.STATE_FRIENDS = 3;

	User_Friendship.fetchRequests = function()
	{
		return Api.sendRequest( '/web/dash/friends/requests', null, { detach: true } ).then( function( response )
		{
			return {
				requests: User_Friendship.populate( response.requests ),
				pending: User_Friendship.populate( response.pending ),
			};
		} );
	};

	User_Friendship.fetchCount = function()
	{
		return Api.sendRequest( '/web/dash/friends/requests/count', null, { detach: true } );
	};

	User_Friendship.prototype.getThem = function( us )
	{
		return this.user_id !== us.id ? this.user : this.target_user;
	};

	User_Friendship.prototype.$save = function()
	{
		return this.$_save( '/web/dash/friends/requests/add/' + this.target_user_id, 'userFriendship' );
	};

	User_Friendship.prototype.$accept = function()
	{
		return this.$_save( '/web/dash/friends/requests/accept/' + this.id, 'userFriendship' );
	};

	User_Friendship.prototype.$remove = function()
	{
		return this.$_remove( '/web/dash/friends/requests/remove/' + this.id );
	};

	return Model.create( User_Friendship );
} );
