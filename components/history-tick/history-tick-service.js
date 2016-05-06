angular.module( 'gj.HistoryTick' ).service( 'HistoryTick', function( $document, $q, Environment, Referrer, Device )
{
	var _this = this;
	var _sources = {};

	/**
	 * You can track a source for a particular parent resource.
	 * For example, tracking the current referrer for a Game and then any time
	 * you log a tick for a type within that Game (game-build, game-news, etc)
	 * it will pull the source referrer into the tick.
	 *
	 * Note that we only log the first referrer for a particular resource.
	 * If you get to this resource through different means we'll still just
	 * track the initial way of getting there.
	 */
	this.trackSource = function( resource, resourceId )
	{
		// Look specifically for undefined and not just null.
		// There may have been a null referrer if we got here through a direct page hit.
		if ( angular.isUndefined( _sources[ resource + ':' + resourceId ] ) ) {
			_sources[ resource + ':' + resourceId ] = Referrer.get();
		}
	};

	this.getSource = function( resource, resourceId )
	{
		return _sources[ resource + ':' + resourceId ];
	};

	this.sendBeacon = function( type, resourceId, options )
	{
		options = options || {};

		if ( Environment.isPrerender ) {
			return;
		}

		return $q( function( resolve, reject )
		{
			var queryParams = [];

			// Cache busting.
			queryParams.push( 'cb=' + Date.now() );

			// Device info.
			queryParams.push( 'os=' + Device.os() );
			var arch = Device.arch();
			if ( arch ) {
				queryParams.push( 'arch=' + arch );
			}

			// Source/referrer.
			if ( options.sourceResource && options.sourceResourceId ) {
				var source = _this.getSource( options.sourceResource, options.sourceResourceId );
				if ( source ) {
					queryParams.push( 'source=' + source );
				}
			}

			// Key.
			if ( options.key ) {
				queryParams.push( 'key=' + options.key );
			}

			// This is enough to send the beacon.
			// No need to add it to the page.
			var img = $document[0].createElement( 'img' );
			img.width = 1;
			img.height = 1;
			img.src = Environment.apiHost + '/tick/' + type + '/' + resourceId + '?' + queryParams.join( '&' );

			// Always resolve.
			img.onload = img.onerror = function()
			{
				img.onload = null;
				img.onerror = null;
				resolve();
			};

			if ( Environment.env == 'development' ) {
				console.log( 'Tracking history tick.', {
					type: type,
					resourceId: resourceId,
					queryString: queryParams.join( '&' ),
				} );
			}
		} );
	};
} );
