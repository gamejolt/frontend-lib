angular.module( 'gj.Ad' ).directive( 'gjAd', function( $timeout, $window, $document, $interpolate, $parse, Ads, Environment )
{
	var _globalTagId = '1437670388518';

	/**
	 * Only bootstrap once.
	 */
	function _bootstrapAds()
	{
		if ( Ads.isBootstrapped ) {
			return;
		}

		Ads.isBootstrapped = true;

		var document = $document[0];

		$window.googletag = {};  // We always start from scratch on every bootstrap.
		$window.googletag.cmd = $window.googletag.cmd || [];

		// var weirdContainerThing = $( 'iframe[name="google_osd_static_frame"]' );
		// if ( weirdContainerThing ) {
		// 	weirdContainerThing.remove();
		// }

		(function() {
			var oldScript = null;
			if ( oldScript = document.getElementById( 'ads-script-bootsrapper' ) ) {
				oldScript.parentNode.removeChild( oldScript );
			}

			var gads = document.createElement('script');
			gads.id = 'ads-script-bootsrapper';
			gads.async = true;
			gads.type = 'text/javascript';
			gads.src = 'https://www.googletagservices.com/tag/js/gpt.js';
			var node = document.getElementsByTagName('script')[0];
			node.parentNode.insertBefore(gads, node);
		})();

		$window.googletag.cmd.push( function()
		{
			$window.googletag.defineSlot('/27005478/web-display-leaderboard', [[728, 90], [970, 90]], 'div-gpt-ad-' + _globalTagId + '-10').addService(googletag.pubads());
			$window.googletag.defineSlot('/27005478/web-display-leaderboard', [[728, 90], [970, 90]], 'div-gpt-ad-' + _globalTagId + '-11').addService(googletag.pubads());
			$window.googletag.defineSlot('/27005478/web-display-leaderboard', [[728, 90], [970, 90]], 'div-gpt-ad-' + _globalTagId + '-12').addService(googletag.pubads());
			$window.googletag.defineSlot('/27005478/web-display-leaderboard', [[728, 90], [970, 90]], 'div-gpt-ad-' + _globalTagId + '-13').addService(googletag.pubads());

			$window.googletag.defineSlot('/27005478/web-display-rectangle', [[300, 250], [300, 600]], 'div-gpt-ad-' + _globalTagId + '-20').addService(googletag.pubads());
			$window.googletag.defineSlot('/27005478/web-display-rectangle', [[300, 250], [300, 600]], 'div-gpt-ad-' + _globalTagId + '-21').addService(googletag.pubads());

			$window.googletag.defineSlot('/27005478/web-display-160x600', [160, 600], 'div-gpt-ad-' + _globalTagId + '-30').addService(googletag.pubads());
			$window.googletag.defineSlot('/27005478/web-display-160x600', [160, 600], 'div-gpt-ad-' + _globalTagId + '-31').addService(googletag.pubads());

			$window.googletag.enableServices();
		} );
	}

	function _cleanupAds()
	{
		Ads.isBootstrapped = false;
	}

	return {
		restrict: 'E',
		templateUrl: '/lib/gj-lib-client/components/ad/ad.html',
		scope: {},
		compile: function( element, attrs )
		{
			var adSizeInterpolated = $interpolate( attrs.adSize );
			var resourceInterpolated = attrs.adResource ? $interpolate( attrs.adResource ) : undefined;
			var resourceIdParsed = attrs.adResourceId ? $parse( attrs.adResourceId ) : undefined;

			return {
				pre: function( scope, element, attrs )
				{
					// One time parsing.
					scope.adSize = adSizeInterpolated( scope.$parent );

					scope.adId = 0;
					scope.globalTagId = _globalTagId;
					++Ads.numActive;

					// Send the beacon saying that we've viewed this ad.
					var resource = null;
					var resourceId = null;
					if ( resourceInterpolated && resourceIdParsed ) {
						resource = resourceInterpolated( scope.$parent );
						resourceId = resourceIdParsed( scope.$parent );
					}

					Ads.sendBeacon( Ads.TYPE_DISPLAY, resource, resourceId );

					if ( scope.adSize == 'leaderboard' ) {
						scope.adId = 10 + Ads.numLeaderboards;
						++Ads.numLeaderboards;
					}
					else if ( scope.adSize == 'rectangle' ) {
						scope.adId = 20 + Ads.numRectangles;
						++Ads.numRectangles;
					}
					else if ( scope.adSize == 'skyscraper' ) {
						scope.adId = 30 + Ads.numSkyscrapers;
						++Ads.numSkyscrapers;
					}

					scope.$on( '$destroy', function()
					{
						--Ads.numActive;

						if ( scope.adSize == 'leaderboard' ) {
							--Ads.numLeaderboards;
						}
						else if ( scope.adSize == 'rectangle' ) {
							--Ads.numRectangles;
						}
						else if ( scope.adSize == 'skyscraper' ) {
							--Ads.numSkyscrapers;
						}

						// If we have no more active ads clean up the ad code.
						// It should mean that we switched pages.
						if ( Ads.numActive <= 0 ) {
							_cleanupAds();
						}
					} );
				},
				post: function( scope, element )
				{
					// Don't do anything if we're just prerendering the page.
					if ( Environment.isPrerender ) {
						return;
					}

					var adInnerElem = element[0].getElementsByClassName( 'ad-inner' )[0];

					var googlePlaceholderElem = $document[0].createElement( 'div' );
					googlePlaceholderElem.id = 'div-gpt-ad-' + scope.globalTagId + '-' + scope.adId;
					adInnerElem.appendChild( googlePlaceholderElem );

					if ( Environment.buildType == 'production' && !Environment.isClient ) {
						_bootstrapAds();

						var scriptElem = $document[0].createElement( 'script' );
						scriptElem.type = 'text/javascript';
						scriptElem.text = "googletag.cmd.push(function() { googletag.display('div-gpt-ad-" + scope.globalTagId + "-" + scope.adId + "'); });";
						googlePlaceholderElem.appendChild( scriptElem );
					}
					else {
						googlePlaceholderElem.innerHTML = '<div class="ad-placeholder"></div>';
					}
				}
			};
		}
	};
} );
