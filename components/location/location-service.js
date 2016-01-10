angular.module( 'gj.Location' ).service( 'Location', function( $timeout, $location, $state, $injector, Meta, Environment )
{
	var isApplyPending = false;
	var pendingParams = null;

	/**
	 * Simply enforces that our current state is the correct URL.
	 * You pass in the params that you want to check for and forces it into the current state with those params.
	 * This is mostly used to ensure slugs are up to date after fetching from server.
	 *
	 * Multiple nested controllers may call it, so we want to take the last params that were given
	 * to us and only set one $apply to run.
	 */
	this.enforce = function( params )
	{
		pendingParams = params;

		if ( isApplyPending ) {
			return;
		}

		isApplyPending = true;

		$timeout( function()
		{
			var $stateParams = $injector.get( '$stateParams' );
			var mergedParams = angular.extend( {}, $stateParams, pendingParams );

			// Only change the URL if the params we need to enforce aren't set.
			// If they're the same, the URL doesn't need to be changed. It's correct.
			if ( angular.equals( mergedParams, $stateParams ) ) {
				return;
			}

			// Gotta keep the hash.
			// $stateParams doesn't have it, but we need to set it when we call `go()`.
			if ( !mergedParams['#'] && $location.hash() ) {
				mergedParams['#'] = $location.hash();
			}

			// This will do a controller refresh, which kind of sucks, but it's more important to keep the URL up to date.
			// NOTE: Setting `notify` to false doesn't work. ui-sref links don't get updated with the new URL.
			// When prerendering we don't redirect in browser, we just send a redirect header.
			if ( Environment.isPrerender ) {
				Meta.redirect = $state.href( $state.current, mergedParams );
				Meta.responseCode = 301;
			}
			else {
				$state.go( $state.current, mergedParams, { location: 'replace' } );
			}

			isApplyPending = false;
			pendingParams = null;
		} );
	};

	this.redirectState = function( state, params )
	{
		// We don't actually redirect if we're prerendering.
		// We instead just return a redirect header.
		if ( Environment.isPrerender ) {
			Meta.redirect = $state.href( state, params );
			Meta.responseCode = 301;
		}
		else {
			$state.go( state, params, { location: 'replace' } );
		}
	};
} );
