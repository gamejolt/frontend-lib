angular.module( 'gj.Social.Facebook.Sdk' ).service( 'Facebook_Sdk', function( $document, $window, $timeout, $injector, Environment )
{
	var isBootstrapped = false;

	function setupEvents()
	{
		if ( $injector.has( 'Analytics' ) ) {
			var Analytics = $injector.get( 'Analytics' );

			$window.FB.Event.subscribe( 'edge.create', function( url )
			{
				Analytics.trackSocial( Analytics.SOCIAL_NETWORK_FB, Analytics.SOCIAL_ACTION_LIKE, url );
			} );

			$window.FB.Event.subscribe( 'message.send', function( url )
			{
				Analytics.trackSocial( Analytics.SOCIAL_NETWORK_FB, Analytics.SOCIAL_ACTION_SEND, url );
			} );
		}
	}

	this.load = function()
	{
		if ( Environment.isPrerender ) {
			return;
		}

		if ( !isBootstrapped ) {
			var elem = $document[0].createElement( 'div' );
			elem.id = 'fb-root';
			$document[0].body.appendChild( elem );

			(function(d, s, id) {
				var js, fjs = d.getElementsByTagName(s)[0];
				if (d.getElementById(id)) return;
				js = d.createElement(s);
				js.id = id;
				js.onload = setupEvents;
				js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.4&appId=410666682312265";
				fjs.parentNode.insertBefore(js, fjs);
			}(document, 'script', 'facebook-jssdk'));
		}
		else {
			$timeout( function()
			{
				if ( typeof $window.FB != 'undefined' ) {
					$window.FB.XFBML.parse();
				}
			} );
		}

		isBootstrapped = true;
	};
} );
