angular.module( 'gj.Connection' ).factory( 'Connection_Reconnect', function( $timeout, $http, Environment )
{
	// We just hit the favicon from the CDN.
	// Should be pretty lightweight.
	var CHECK_URL = 'https://b6d3e9q9.ssl.hwcdn.net/app/img/favicon.png';

	if ( Environment.env == 'development' ) {
		CHECK_URL = 'http://development.gamejolt.com/app/img/favicon.png';
	}

	var TIMEOUT_INITIAL = 2000;
	var TIMEOUT_GROW = 1.5;
	var TIMEOUT_MAX = 30000;

	function Connection_Reconnect( failFn, successFn )
	{
		this._failFn = failFn;
		this._successFn = successFn;
		this._timeoutMs = TIMEOUT_INITIAL;
		this._timeoutPromise = null;

		this.check();
	}

	Connection_Reconnect.prototype._setTimeout = function()
	{
		var _this = this;

		_this._timeoutPromise = $timeout( function()
		{
			// Before checking reset the timeout details.
			_this._timeoutMs = Math.min( TIMEOUT_MAX, _this._timeoutMs * TIMEOUT_GROW );
			_this._timeoutPromise = null;

			// Now check to see if we're back online.
			_this.check();
		}, _this._timeoutMs );
	};

	Connection_Reconnect.prototype.check = function()
	{
		var _this = this;

		// Make sure we don't cache the call.
		$http.head( CHECK_URL + '?cb=' + Date.now() )
			.then( function( response )
			{
				_this.finish();
			} )
			.catch( function( response )
			{
				// Just as long as the response doesn't have a status code of -1.
				// After all, a 404 still means that we are connected to the internet.
				if ( response.status != -1 ) {
					_this.finish();
				}
				else {
					// Still failing, so keep going.
					_this._failFn();
					_this._setTimeout();
				}
			} );
	};

	Connection_Reconnect.prototype.finish = function()
	{
		// If this was called when we're currently waiting on a timeout we need to clean it up.
		if ( this._timeoutPromise ) {
			$timeout.cancel( this._timeoutPromise );
		}

		this._successFn();
	};

	return Connection_Reconnect;
} );
