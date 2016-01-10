angular.module( 'gj.Subscription' ).factory( 'Subscription', function( Model )
{
	function Subscription( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}
	}

	Subscription.$subscribe = function( commentId )
	{
		var subscription = new Subscription();
		subscription.comment_id = commentId;

		return subscription.$save().then( function()
		{
			return subscription;
		} );
	};

	Subscription.prototype.$save = function()
	{
		if ( !this.id ) {
			return this.$_save( '/comments/subscriptions/add/' + this.comment_id, 'subscription', { ignorePayloadUser: true } );
		}

		throw new Error( 'No edit method for subscriptions.' );
	};

	Subscription.prototype.$remove = function()
	{
		return this.$_remove( '/comments/subscriptions/remove/' + this.id, { ignorePayloadUser: true } );
	};

	return Model.create( Subscription );
} );
