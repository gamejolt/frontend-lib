// This needs to be done before angular loads.
// Angular attaches to this event as well and if we don't bind first
// then the statechange stuff will fire before we're able to react
// to the pop event.
window.addEventListener( 'popstate', function()
{
	if ( window._gjHistoryPop ) {
		window._gjHistoryPop();
	}
} );

angular.module( 'gj.History' )
.run( function( $rootScope, $state, $window, $location, History )
{
	// Clear ourselves out on success or error.
	$rootScope.$on( '$stateChangeSuccess', function()
	{
		History._reset();
	} );

	$rootScope.$on( '$stateChangeError', function()
	{
		History._reset();
	} );
} )
.service( 'History', function( $q, $window, $timeout, $rootScope, $state, $location )
{
	var _this = this;

	this.inHistorical = false;

	$window._gjHistoryPop = function()
	{
		_this.inHistorical = true;
	};

	this._reset = function()
	{
		// Do it in next digest.
		$timeout( function()
		{
			_this.inHistorical = false;
		} );
	};
} );
