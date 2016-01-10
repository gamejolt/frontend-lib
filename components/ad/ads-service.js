angular.module( 'gj.Ad' ).service( 'Ads', function( $document, Environment )
{
	this.TYPE_DISPLAY = 'display';
	this.TYPE_VIDEO = 'video';

	this.RESOURCE_TYPE_NONE = 1;
	this.RESOURCE_TYPE_GAME = 2;
	this.RESOURCE_TYPE_USER = 3;
	this.RESOURCE_TYPE_FIRESIDE_POST = 4;

	this.isBootstrapped = false;
	this.numActive = 0;
	this.numLeaderboards = 0;
	this.numRectangles = 0;
	this.numSkyscrapers = 0;

	this.sendBeacon = function( type, resource, resourceId )
	{
		if ( Environment.isPrerender ) {
			return;
		}

		var queryString = '';

		// Cache busting.
		queryString += 'cb=' + Date.now();

		if ( resource ) {
			if ( resource == 'Game' ) {
				queryString += '&resource_type=' + this.RESOURCE_TYPE_GAME;
				queryString += '&resource_id=' + resourceId;
			}
			else if ( resource == 'User' ) {
				queryString += '&resource_type=' + this.RESOURCE_TYPE_USER;
				queryString += '&resource_id=' + resourceId;
			}
			else if ( resource == 'Fireside_Post' ) {
				queryString += '&resource_type=' + this.RESOURCE_TYPE_FIRESIDE_POST;
				queryString += '&resource_id=' + resourceId;
			}
		}

		// This is enough to send the beacon.
		// No need to add it to the page.
		var img = $document[0].createElement( 'img' );
		img.src = Environment.apiHost + '/adserver/log/' + type + '?' + queryString;
	};
} );
