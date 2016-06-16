angular.module( 'gj.Social.Youtube.Sdk' ).service( 'Youtube_Sdk', function( $document, $window, $timeout, $injector, $location, Environment )
{
	var isBootstrapped = false;

	function setupEvents()
	{
		if ( $injector.has( 'Analytics' ) ) {
			var Analytics = $injector.get( 'Analytics' );

			$window.onYtEvent = function( payload )
			{
				if ( payload.eventType == 'subscribe' ) {
					var url = $location.url();
					Analytics.trackSocial( Analytics.SOCIAL_NETWORK_YOUTUBE, Analytics.SOCIAL_ACTION_SUBSCRIBE, url );
				}
				else if ( payload.eventType == 'unsubscribe' ) {
					var url = $location.url();
					Analytics.trackSocial( Analytics.SOCIAL_NETWORK_YOUTUBE, Analytics.SOCIAL_ACTION_UNSUBSCRIBE, url );
				}
			};
		}
	}

	this.load = function()
	{
		if ( Environment.isPrerender ) {
			return;
		}

		if ( !isBootstrapped ) {
			!function(d,s,id){
				var js,fjs=d.getElementsByTagName(s)[0];
				if(!d.getElementById(id)){
					js=d.createElement(s);
					js.id=id;
					js.src='https://apis.google.com/js/platform.js';
					fjs.parentNode.insertBefore(js,fjs);
				}
			}(document, 'script', 'youtube-sdk');
		}
		else {
			$timeout( function()
			{
				if ( typeof $window.gapi != 'undefined' ) {
					$window.gapi.ytsubscribe.go();
				}
			} );
		}

		isBootstrapped = true;
	};
} );
