angular.module( 'gj.HistoryTick' ).service( 'HistoryTick', function( $document, $q, Environment )
{
	this.sendBeacon = function( type, resourceId )
	{
		if ( Environment.isPrerender ) {
			return;
		}

		var queryString = '';

		// Cache busting.
		queryString += 'cb=' + Date.now();

		return $q( function( resolve, reject )
		{
			// This is enough to send the beacon.
			// No need to add it to the page.
			var img = $document[0].createElement( 'img' );
			img.width = 1;
			img.height = 1;
			img.src = Environment.apiHost + '/tick/' + type + '/' + resourceId + '?' + queryString;

			// Always resolve.
			img.onload = img.onerror = function()
			{
				img.onload = null;
				img.onerror = null;
				resolve();
			};
		} );
	};
} );
