angular.module( 'gj.Meta' ).service( 'Meta', function( $rootScope, $state, $window )
{
	var _this = this;

	clear();

	$rootScope.$on( '$stateChangeSuccess', function()
	{
		clear();
	} );

	function clear()
	{
		_this.description = null;
		_this.currentLocation = $window.location.href;
		_this.redirect = null;
		_this.responseCode = null;

		_this.fb = {
			title: null,
			description: null,
			url: null,
			type: null,
			image: null,
			profileId: null,
		};

		_this.twitter = {
			title: null,
			description: null,
			card: null,
			image: null,
			url: null,
			shareMessage: null,
		};
	}
} );
