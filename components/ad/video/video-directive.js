angular.module( 'gj.Ad.Video' ).directive( 'gjAdVideo', function()
{
	return {
		restrict: 'E',
		template: require( '!html-loader!./video.html' ),
		scope: {
			resource: '@adResource',
			resourceId: '=adResourceId',
			resourceLabel: '=?adResourceLabel',
			trackingLabel: '@?eventTrackingLabel',
			onAdShown: '&?',
		},
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function( $q, $window, $document, $location, $element, $scope, Analytics, Environment, Ads )
		{
			var _this = this;

			var videoElem, adContainerElem;

			this.adsManager = undefined;
			this.isAdPlaying = true;

			var remainingInterval;
			this.timeRemaining = undefined;

			if ( !this.resourceLabel ) {
				this.resourceLabel = 'game';
			}

			this.toggle = function()
			{
				if ( _this.isAdPlaying ) {
					_this.adsManager.pause();
					_this.isAdPlaying = false;
				}
				else {
					_this.adsManager.resume();
					_this.isAdPlaying = true;
				}
			}

			// Load in the google IMA script.
			var imaScript = $document[0].createElement( 'script' );
			imaScript.type = 'text/javascript';
			imaScript.async = true;

			var docHead = $document[0].head || $document[0].getElementsByTagName( 'head' )[0];
			docHead.appendChild( imaScript );

			var loadPromise = $q( function( resolve, reject )
			{
				imaScript.onload = resolve;
				imaScript.onerror = reject;
			} );

			imaScript.src = 'https://imasdk.googleapis.com/js/sdkloader/ima3.js';

			loadPromise
				.then( function()
				{
					return $q( function( resolve, reject )
					{
						videoElem = $element.find( 'video' )[0];
						adContainerElem = $element[0].getElementsByClassName( 'ad-video-player-ad-container' )[0];

						// Create initialize the ad container.
						var adDisplayContainer = new $window.google.ima.AdDisplayContainer( adContainerElem, videoElem );
						adDisplayContainer.initialize();

						// Set up an ads loader.
						var adsLoader = new $window.google.ima.AdsLoader( adDisplayContainer );
						adsLoader.getSettings().setVpaidAllowed( true );

						adsLoader.addEventListener( $window.google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, onAdLoaded, false );
						adsLoader.addEventListener( $window.google.ima.AdErrorEvent.Type.AD_ERROR, onAdError, false );

						var adsRequest = new $window.google.ima.AdsRequest();

						if ( Environment.env == 'development' ) {
							adsRequest.adTagUrl = 'https://pubads.g.doubleclick.net/gampad/ads?' +
								'sz=640x360&iu=/6062/iab_vast_samples/skippable&ciu_szs=300x250,728x90&' +
								'impl=s&gdfp_req=1&env=vp&output=xml_vast2&unviewed_position_start=1&' +
								'url=[referrer_url]&correlator=[timestamp]';
						}
						else {
							adsRequest.adTagUrl = 'https://pubads.g.doubleclick.net/gampad/ads' +
								'?sz=854x480&iu=/27005478/web-video-browser&ciu_szs=300x60,300x250,728x90' +
								'&impl=s&gdfp_req=1&env=vp&output=xml_vast2&unviewed_position_start=1' +
								'&url=[referrer_url]&correlator=[timestamp]' +
								'&cust_params=' + $window.encodeURIComponent( 'ref_url=' + $window.encodeURIComponent( $location.absUrl() )  );
						}

						adsRequest.linearAdSlotWidth = 910;
						adsRequest.linearAdSlotHeight = 512;

						// This'll start the ads request process.
						// Will either call onAdError or onAdLoaded.
						adsLoader.requestAds( adsRequest );

						function onAdLoaded( event )
						{
							$scope.$applyAsync( function()
							{
								_this.adsManager = event.getAdsManager( videoElem );

								function updateTimeRemaining()
								{
									// Only have to digest current scope.
									_this.timeRemaining = _this.adsManager.getRemainingTime();
									$scope.$digest();
								}

								// Set up all the events.
								_this.adsManager.addEventListener( $window.google.ima.AdErrorEvent.Type.AD_ERROR, onAdError );

								_this.adsManager.addEventListener( $window.google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, function onContentPauseRequested()
								{
									videoElem.pause();
									_this.isAdPlaying = true;
									$scope.$digest();
								} );

								_this.adsManager.addEventListener( $window.google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, function onContentResumeRequested()
								{
									videoElem.play();
									_this.isAdPlaying = false;
									$scope.$digest();
								} );

								_this.adsManager.addEventListener( $window.google.ima.AdEvent.Type.STARTED, function()
								{
									Analytics.trackEvent( _this.trackingLabel || 'Video Ad', 'Started', 'IMA' );

									updateTimeRemaining();
									remainingInterval = $window.setInterval( function()
									{
										updateTimeRemaining();
									}, 1000 );
								} );

								_this.adsManager.addEventListener( $window.google.ima.AdEvent.Type.IMPRESSION, function()
								{
									Ads.sendBeacon( Ads.TYPE_VIDEO, _this.resource, _this.resourceId );
								} );

								_this.adsManager.addEventListener( $window.google.ima.AdEvent.Type.CLICK, function()
								{
									Analytics.trackEvent( _this.trackingLabel || 'Video Ad', 'Clicked', 'IMA' );
									_this.toggle();
									$scope.$digest();
								} );

								_this.adsManager.addEventListener( $window.google.ima.AdEvent.Type.SKIPPED, function( event )
								{
									Analytics.trackEvent( _this.trackingLabel || 'Video Ad', 'Skipped', 'IMA' );
									resolve();
								} );

								_this.adsManager.addEventListener( $window.google.ima.AdEvent.Type.COMPLETE, function()
								{
									Analytics.trackEvent( _this.trackingLabel || 'Video Ad', 'Completed', 'IMA' );
									resolve();
								} );

								try {
									_this.adsManager.init( 910, 512, $window.google.ima.ViewMode.NORMAL );
									_this.adsManager.start();
								}
								catch ( adError ) {
									reject( adError );
								}
							} );
						}

						function onAdError( event )
						{
							reject( event.getError() );
						}
					} );
				} )
				.catch( function( e )
				{
					// May be DOMError or google.ima.AdError.
					if ( e.message ) {
						Analytics.trackEvent( _this.trackingLabel || 'Video Ad', 'Ad Error', e.message );
						return;
					}

					switch( e.getErrorCode() ) {
						case 303:
							Analytics.trackEvent( _this.trackingLabel || 'Video Ad', 'No Ad', e.getMessage() );
							break;

						case 403:
							Analytics.trackEvent( _this.trackingLabel || 'Video Ad', 'Invalid Ad Format', e.getMessage() );
							break;

						default:
							Analytics.trackEvent( _this.trackingLabel || 'Video Ad', 'Ad Error', e.getErrorCode() + ' - ' + e.getMessage() );
					}
				} )
				.finally( function()
				{
					cleanup();

					if ( _this.onAdShown ) {
						_this.onAdShown( {} );
					}
				} );

			function cleanup()
			{
				$element[0].classList.add( 'ad-video-teardown' );

				if ( _this.adsManager ) {
					_this.adsManager.destroy();
				}

				if ( remainingInterval ) {
					$window.clearInterval( remainingInterval );
				}
			}

			$scope.$on( '$destroy', function()
			{
				cleanup();
			} );
		}
	};
} );
