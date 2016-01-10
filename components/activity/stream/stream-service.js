angular.module( 'gj.Activity.Stream' ).provider( 'Activity_Stream', function()
{
	this.$get = function( $rootScope, $q, Activity_Stream_Subscription, Environment, Primus )
	{
		var Activity_Stream = {};

		var primus;
		var connectionPromise;

		var isInitialized = false;
		var subscriptions = {};
		var subscriptionCounter = 0;

		function ensureConnection()
		{
			if ( connectionPromise ) {
				return connectionPromise;
			}

			// If we're prerendering, then we can't create a websocket connection or it'll never finish the request.
			// In that case, let's just return a promise that never resolves.
			if ( Environment.isPrerender ) {
				return $q( function( resolve, reject ){} );
			}

			connectionPromise = Primus.createConnection( Environment.activityStreamHost )
				.then( function( _primus )
				{
					primus = _primus;

					// On new connection or reconnection to the server.
					primus.on( 'open', function()
					{
						// If we've already initialized the connection before, then this is a reconnection.
						// In this case we need to resubscribe to our channels.
						if ( isInitialized ) {
							angular.forEach( subscriptions, function( subscription )
							{
								primus.write( {
									event: 'channel-subscribe',
									name: subscription.name,
									input: subscription.input
								} );
							} );
						}

						isInitialized = true;
					} );

					// On any data received send it off to all message handlers of all subscriptions.
					primus.on( 'data', function( message )
					{
						$rootScope.$apply( function()
						{
							angular.forEach( subscriptions, function( subscription )
							{
								subscription.messageHandler( message );
							} );
						} );
					} );

					return primus;
				} );

			return connectionPromise;
		}

		Activity_Stream.subscribe = function( name, input, messageHandler, onConnected )
		{
			// We pass through the connection promise to each subscription.
			// This allows each one to only subscribe to the channel when we are connected to the streaming server.
			var subscriptionPromise = ensureConnection();

			// If they had a connection event handler, then set it up in the promise chain to occur after connection.
			if ( onConnected ) {
				subscriptionPromise = subscriptionPromise.then( function( primus )
				{
					if ( onConnected && angular.isFunction( onConnected ) ) {
						onConnected();
					}

					// Keep primus returning!
					return primus;
				} );
			}

			++subscriptionCounter;
			var subscription = new Activity_Stream_Subscription( subscriptionPromise, subscriptionCounter, name, input, messageHandler );
			subscriptions[ subscriptionCounter ] = subscription;

			return subscription;
		};

		/**
		 * This is a callback that subscriptions use to let us know that they are closed.
		 */
		Activity_Stream._subscriptionClosed = function( subscription )
		{
			delete subscriptions[ subscription.id ];
		};

		return Activity_Stream;
	};
} );
