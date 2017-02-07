angular.module( 'gj.History.Cache' )
.run( function( $transitions, $state, History_Cache )
{
	$transitions.onBefore( {}, function( trans )
	{
		if ( trans.to() ) {
			History_Cache.stateStart( $state.href( trans.to(), trans.params( 'to' ) ) );
		}
	} );

	$transitions.onSuccess( {}, function( trans )
	{
		if ( trans.to() ) {
			History_Cache.stateSuccess();
		}
	} );
} )
.service( 'History_Cache', function( $window, History )
{
	var MAX_ITEMS = 5;

	var _states = [];
	var _currentState = null;

	this.cache = function()
	{
		var name, fn;
		if ( arguments.length == 2 ) {
			name = arguments[0];
			fn = arguments[1];
		}
		else {
			name = 'payload';
			fn = arguments[0];
		}

		// We only pull from cache if they're in a historical state.
		if ( History.inHistorical && _currentState.data[ name ] ) {
			return Promise.resolve( _currentState.data[ name ] );
		}

		return fn().then( function( data )
		{
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
		_states.push( _currentState );
		_currentState = null;

		// Prune the cache data to a certain number of states.
		_states = _states.slice( -MAX_ITEMS );
	};
} );
