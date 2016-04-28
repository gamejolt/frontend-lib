/**
 * Since we're in a single page app, the referrer doesn't get reset on every page change.
 * To be able to pull the correct referrer we need to spoof it by updating on every state change.
 * The initial referrer from the Document should be correct when we first hit the page.
 * If it's "null" then there was no referrer when hitting the initial page.
 */
angular.module( 'gj.Referrer' )
.run( function( Referrer )
{
	Referrer.init();
} )
.service( 'Referrer', function( $rootScope, $document, $location )
{
	/**
	 * We will set this to false after the first page change.
	 * We don't artifically track new referrers until after the first page has passed.
	 */
	var _firstPass = true;

	/**
	 * After every location change we store the current URL.
	 * We can use this value as the referrer when switching to the next page.
	 */
	var _currentUrl = null;

	var _prev = null;
	var _referrer = null;

	this.init = function()
	{
		if ( $document[0].referrer ) {
			_referrer = $document[0].referrer;
		}

		$rootScope.$on( '$stateChangeStart', function()
		{
			// Don't track until we've tracked on full page view.
			if ( _firstPass ) {
				return;
			}

			// Store the current one so we can rollback if the state change fails.
			_prev = _referrer;
			_referrer = _currentUrl;
		} );

		$rootScope.$on( '$stateChangeSuccess', function()
		{
			// We have finished the first state change.
			// We will now begin tracking new referrers.
			_firstPass = false;
			_currentUrl = $location.absUrl();
		} );

		$rootScope.$on( '$stateChangeError', function()
		{
			// Rollback.
			_referrer = _prev;
		} );
	};

	this.get = function()
	{
		return _referrer;
	};
} );
