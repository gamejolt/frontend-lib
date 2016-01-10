angular.module( 'gj.Social.Twitter.Sdk' ).service( 'Twitter_Sdk', function( $document, $window, $timeout, $injector, $location, Environment )
{
	var isBootstrapped = false;

	function setupEvents()
	{
		if ( $injector.has( 'Analytics' ) ) {
			var Analytics = $injector.get( 'Analytics' );

			$window.twttr.events.bind( 'tweet', function( event )
			{
				var url = $location.url();
				Analytics.trackSocial( Analytics.SOCIAL_NETWORK_TWITTER, Analytics.SOCIAL_ACTION_TWEET, url );
			} );

			$window.twttr.events.bind( 'follow', function( event )
			{
				var url = $location.url();
				Analytics.trackSocial( Analytics.SOCIAL_NETWORK_TWITTER, Analytics.SOCIAL_ACTION_FOLLOW, url );
			} );
		}
	}

	this.load = function()
	{
		if ( Environment.isPrerender ) {
			return;
		}

		if ( !isBootstrapped ) {
			!function(d,s,id){
				var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';
				if(!d.getElementById(id)){
					js=d.createElement(s);
					js.id=id;
					js.onload=setupEvents;
					js.src=p+'://platform.twitter.com/widgets.js';
					fjs.parentNode.insertBefore(js,fjs);
				}
			}(document, 'script', 'twitter-wjs');
		}
		else {
			$timeout( function()
			{
				if ( typeof $window.twttr != 'undefined' ) {
					$window.twttr.widgets.load();
				}
			} );
		}

		isBootstrapped = true;
	};
} );
