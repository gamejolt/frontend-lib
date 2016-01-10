angular.module( 'gj.Analytics' ).service( 'Analytics', function( $rootScope, $log, $window, $location, $document, $timeout, App, Environment )
{
	var _this = this;
	this.extraTrackers = [];

	var _additionalPageTracker = null;

	this.SOCIAL_NETWORK_FB = 'facebook';
	this.SOCIAL_NETWORK_TWITTER = 'twitter';

	this.SOCIAL_ACTION_LIKE = 'like';
	this.SOCIAL_ACTION_SHARE = 'share';
	this.SOCIAL_ACTION_SEND = 'send';
	this.SOCIAL_ACTION_TWEET = 'tweet';
	this.SOCIAL_ACTION_FOLLOW = 'follow';

	// Force HTTPS tracking beacons.
	$window.ga( 'set', 'forceSSL', true );

	function _ensureUserId()
	{
		if ( App.user && App.user.id ) {
			if ( Environment.env == 'development' ) {
				console.log( 'Set tracking User ID: ' + App.user.id );
			}
			else {
				$window.ga( 'set', '&uid', App.user.id );
			}
		}
		else {
			if ( Environment.env == 'development' ) {
				console.log( 'Unset tracking User ID.' );
			}
			else {
				$window.ga( 'set', '&uid', '' );
			}
		}
	}

	function _shouldTrack()
	{
		// If they're not a normal user, don't track.
		if ( Environment.env == 'production' && App.user && App.user.permission_level > 0 ) {
			return false;
		}

		return true;
	}

	this.trackPageview = function( path, tracker )
	{
		var method = 'send';

		if ( !_shouldTrack() ) {
			console.log( 'Skip tracking page view since not a normal user.' );
			return;
		}

		// Did they pass in a tracker other than the default?
		if ( angular.isDefined( tracker ) ) {

			// Normalize.
			var normalizedTracker = tracker.replace( /[\-_:]/g, '' );

			// Prefix the method with the tracker.
			method = normalizedTracker + '.' + method;

			// If we haven't added this tracker yet in GA, let's do so.
			if ( _.indexOf( _this.extraTrackers, tracker ) === -1 ) {

				// Save that we have this tracker set.
				_this.extraTrackers.push( tracker );

				// Now add it in GA.
				if ( Environment.env == 'development' ) {
					console.log( 'Create new tracker: ' + tracker );
				}
				else {
					$window.ga( 'create', tracker, 'auto', { name: normalizedTracker } );
				}
			}
		}
		else {
			tracker = '';
		}

		// Gotta make sure the system has a chance to compile the title into the page.
		$timeout( function()
		{
			_ensureUserId();

			// If no path passed in, then pull it from the location.
			if ( !path ) {
				path = $location.url();
			}

			// Pull the title.
			var title = $document[0].title;

			var options = {
				page: path,
				title: title,
			};

			// Now track the page view.
			if ( Environment.env == 'development' ) {
				console.log( 'Track page view: tracker(' + tracker + ') | ' + JSON.stringify( options ) );
			}
			else {
				$window.ga( method, 'pageview', options );
			}

			// If they have an additional page tracker attached, then track the page view for that tracker as well.
			if ( !tracker && _additionalPageTracker ) {
				_this.trackPageview( null, _additionalPageTracker );
			}
		} );
	};

	this.trackEvent = function( category, action, label, value )
	{
		if ( !_shouldTrack() ) {
			console.log( 'Skip tracking event since not a normal user.' );
			return;
		}

		_ensureUserId();

		var options = {
			nonInteraction: 1,
		};

		if ( Environment.env == 'development' ) {
			console.log( 'Track event: ' + category + ':' + (action || '-') + ':' + (label || '-') + ':' + (value || '-') + ' | ' + JSON.stringify( options ) );
		}
		else {
			$window.ga( 'send', 'event', category, action, label, value, options );
		}
	};

	this.trackSocial = function( network, action, target )
	{
		if ( !_shouldTrack() ) {
			console.log( 'Skip tracking social event since not a normal user.' );
			return;
		}

		_ensureUserId();

		if ( Environment.env == 'development' ) {
			console.log( 'Track social event: ' + network + ':' + action + ':' + target );
		}
		else {
			$window.ga( 'send', 'social', network, action, target );
		}
	};

	this.trackTiming = function( category, timingVar, value, label )
	{
		$log.info( 'Timing (' + category + (label ? ':' + label : '') + ') ' + timingVar + ' = ' + value );
		if ( Environment.env == 'production' ) {
			$window.ga( 'send', 'timing', category, timingVar, value, label );
		}
	};

	this.setCurrentExperiment = function( experiment, variation )
	{
		// If the chosen variation is -1, then they weren't chosen to run in this experiment, so we skip tracking.
		if ( variation == -1 || variation == '-1' ) {
			return;
		}

		if ( !_shouldTrack() ) {
			console.log( 'Skip setting experiment since not a normal user.' );
			return;
		}

		if ( Environment.env == 'development' ) {
			console.log( 'Set new experiment: ' + experiment + ' = ' + variation );
		}
		else {
			$window.ga( 'set', 'expId', experiment );
			$window.ga( 'set', 'expVar', '' + variation );
		}
	};

	this.attachAdditionalPageTracker = function( scope, trackingId )
	{
		if ( Environment.env == 'development' ) {
			console.log( 'Attached additional tracker: ' + trackingId );
		}

		_additionalPageTracker = trackingId;
		scope.$on( '$destroy', function()
		{
			if ( Environment.env == 'development' ) {
				console.log( 'Detached additional tracker: ' + trackingId );
			}
			_additionalPageTracker = null;
		} );
	};
} );
