angular.module( 'gj.History.Cache' )
.run( function( $rootScope, $state, History_Cache )
{
	$rootScope.$on( '$stateChangeStart', function()
	{
		if ( arguments[1] ) {
			History_Cache.stateStart( $state.href( arguments[1], arguments[2] ) );
		}
	} );

	$rootScope.$on( '$stateChangeSuccess', function()
	{
		if ( arguments[1] ) {
			History_Cache.stateSuccess();
		}
	} );
} )
.service( 'History_Cache', function( $q, $window, $rootScope, $state, History )
{
	var MAX_ITEMS = 5;

	var _states = [];
	var _currentState = null;

	this.cache = function()
	{
		var name, promise;
		if ( arguments.length == 2 ) {
			name = arguments[0];
			promise = arguments[1];
		}
		else {
			name = 'payload';
			promise = arguments[0];
		}

		// We only pull from cache if they're in a historical state.
		console.log( History.inHistorical, _currentState );
		if ( History.inHistorical && _currentState.data[ name ] ) {
			console.log( 'cache hit' );
			return $q.resolve( _currentState.data[ name ] );
		}

		return promise.then( function( data )
		{
			console.log( 'cache miss' );
			_currentState.data[ name ] = data;
			return data;
		} );
	};

	this.stateStart = function( url )
	{
		var state = _.find( _states, { url: url } );

		if ( state ) {
			_currentState = state;
			return;
		}

		_currentState = {
			url: url,
			data: {},
		};
	};

	this.stateSuccess = function()
	{
		if ( !_currentState ) {
			return;
		}

		// Remove any states that already exist for this URL.
		_.remove( _states, { url: _currentState.url } );

		// Push to end.
		console.log( 'added new state', _currentState );
		_states.push( _currentState );
		_currentState = null;

		// Prune the cache data to a certain number of states.
		_states = _states.slice( -MAX_ITEMS );
	};
} );
