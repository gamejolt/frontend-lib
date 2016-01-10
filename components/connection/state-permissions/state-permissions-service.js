angular.module( 'gj.Connection.StatePermissions', [] )
.run( function( $rootScope, $state, Connection, Connection_StatePermissions )
{
	/**
	 * We need to keep track of the currently transitioning state.
	 * This way on a payload failure in the Payload service we can see if we should still
	 * allow the state to transition successfully.
	 */
	$rootScope.$on( '$stateChangeStart', function( event, toState )
	{
		Connection_StatePermissions.setCurrentState( toState );
	} );

	$rootScope.$on( '$stateChangeSuccess', function()
	{
		Connection_StatePermissions.clearCurrentState();
	} );

	$rootScope.$on( '$stateChangeError', function()
	{
		Connection_StatePermissions.clearCurrentState();
	} );

	/**
	 * When a payload fails, check to see if it was because of an offline error.
	 * If so, we need to check if they are allowed to access the state while offline.
	 */
	$rootScope.$on( 'Payload.responseError', function( event, response, requestOptions )
	{
		// We want to process offline, timed out, or aborted requests.
		if ( response.status != -1 ) {
			return;
		}

		// Let's check to see if we're allowed to transition to this state even while offline.
		if ( !requestOptions.detach
			&& !requestOptions.noOfflineStateCheck
			&& Connection_StatePermissions.allowedOffline()
		) {
			// We prevent default, which tells the Payload service to return a success
			// even though the response failed.
			// This way the route will still resolve.
			event.preventDefault();
		}
	} );
} )
.service( 'Connection_StatePermissions', function( $state )
{
	var currentState = null;

	this.setCurrentState = function( state )
	{
		currentState = state;
	};

	this.clearCurrentState = function()
	{
		currentState = null;
	};

	// Returns whether or not the state we're currently transitioning to allows offline mode.
	this.allowedOffline = function()
	{
		// If we're not currently transitioning to a new state, then ignore this.
		// This is usually matters for non detached API requests.
		if ( !currentState ) {
			return false;
		}

		if ( !currentState.data || !currentState.data.availableOffline ) {
			return false;
		}

		return true;
	};
} );
