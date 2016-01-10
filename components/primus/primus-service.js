angular.module( 'gj.Primus', [] ).service( 'Primus', function( $window, $ocLazyLoad, $http, $q )
{
	this.createConnection = function( _host )
	{
		return $ocLazyLoad.load( '/app/modules/primus.js' )
			.then( function()
			{
				// We first have to make an API call to get a host to use.
				// This allows us to go through the load balancer to get a host to contact.
				// After we get the host we can make a direct call to it.
				return getStreamingHost( _host );
			} )
			.then( function( streamingHost )
			{
				// Let's connect to Primus.
				var primus = new $window.Primus( streamingHost, {
					reconnect: {
						maxDelay: 15000,
						minDelay: 500,
						retries: Infinity  // Retry forever.
					}
				} );

				// If the connection fails we need to try to get a new host that may be able to fulfill the
				// connection. Primus will keep trying itself, but we want to spawn another call to get
				// a new streaming host just in case. We do that and then try to update primus with the new
				// url if we find a new host before it reconnects back to the old one.
				var _reconnecting = false;
				primus.on( 'reconnect scheduled', function()
				{
					if ( _reconnecting ) {
						return;
					}
					_reconnecting = true;

					getStreamingHost( _host ).then( function( streamingHost )
					{
						// Only if it didn't reconnect to the old host in time.
						if ( _reconnecting ) {
							primus.url = primus.parse( streamingHost );
						}
					} );
				} );

				primus.on( 'reconnected', function()
				{
					_reconnecting = false;
				} );

				return primus;
			} )
			.catch( function( e )
			{
				throw new Error( e );
			} );
	};

	function getStreamingHost( host )
	{
		return $q( function( resolve, reject )
		{
			queryForHost( host, resolve );
		} );
	}

	function queryForHost( host, resolve )
	{
		$http.get( host + '/_info', { ignoreLoadingBar: true } )
			.then( function( response )
			{
				var protocol = host.search( /^https/ ) === -1 ? 'http' : 'https';
				if ( response.status != 200 ) {
					throw new Error( 'Could not find host.' );
				}

				resolve( protocol + '://' + response.data.host );
			} )
			.catch( function( response )
			{
				window.setTimeout( function()
				{
					queryForHost( host, resolve );
				}, (1000 + (Math.random() * 5000)) );
			} );
	}
} );
