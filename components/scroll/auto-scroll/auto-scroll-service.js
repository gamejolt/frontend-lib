angular.module( 'gj.Scroll.AutoScroll' ).service( 'AutoScroll', function( $rootScope, $location, $timeout, $document, Scroll )
{
	var _states = {};
	var _noScroll = false;
	var _anchor = null;

	/**
	 * Push a new state on to the state stack.
	 */
	this.pushState = function( url, element )
	{
		var newState = {};

		newState.scroll = element.scrollTop();
		newState.changedOn = Date.now();

		_states[ url ] = newState;
		return this;
	};

	/**
	 * Tries to fetch a state for the current URL.
	 */
	this.getState = function( currentUrl )
	{
		return _states[ currentUrl ] || false;
	};

	/**
	 * Getter/setter for no-scroll behavior.
	 */
	this.noScroll = function( noScroll )
	{
		if ( angular.isUndefined( noScroll ) ) {
			return _noScroll;
		}

		_noScroll = !!noScroll;

		return this;
	};

	this.anchor = function( anchor )
	{
		if ( angular.isUndefined( anchor ) ) {
			return _anchor;
		}

		_anchor = anchor;

		return this;
	};

	$rootScope.$watch( function()
	{
		return $location.hash();
	},
	function( newVal, oldVal )
	{
		if ( newVal === oldVal && newVal === '' ) {
			return;
		}

		$timeout( function()
		{
			if ( $document[0].getElementById( newVal ) ) {
				Scroll.to( newVal );
			}
		}, 50, false );
	} );
} );
