angular.module( 'gj.Activity.Stream' ).factory( 'Activity_Stream_Subscription', function( $injector )
{
	function Activity_Stream_Subscription( subscriptionPromise, id, name, input, messageHandler )
	{
		var _this = this;

		this.subscriptionPromise;
		this.primus = null;

		this.id = id;
		this.name = name;
		this.input = input;
		this.messageHandler = messageHandler;

		// This will ensure that the we are connected to the stream server before subscribing to the channel.
		// We use this promise chain to manage the lifecycle of this particular subscription.
		this.subscriptionPromise = subscriptionPromise
			.then( function( primus )
			{
				_this.primus = primus;

				// Subscribe to the channel.
				// If we aren't yet connected to the server, primus will queue it up and send when we are.
				primus.write( {
					event: 'channel-subscribe',
					name: _this.name,
					input: _this.input,
				} );
			} );
	}

	Activity_Stream_Subscription.prototype.unsubscribe = function()
	{
		var _this = this;

		// Chaining it to the connection/subscription promise, we ensure that we do things in order.
		// It will ensure that we're connected before unsubscribing.
		// Doing it this way ensures we never have a race condition where unsubscribe would be called before subscribe.
		this.subscriptionPromise = this.subscriptionPromise
			.then( function()
			{
				_this.primus.write( {
					event: 'channel-unsubscribe',
					name: _this.name,
					input: _this.input,
				} );

				// We have to let the main service know that this subscription is now cleaned up.
				$injector.get( 'Activity_Stream' )._subscriptionClosed( _this );
			} );
	};

	return Activity_Stream_Subscription;
} );
