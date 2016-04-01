angular.module( 'gj.Debug.DebugBar' ).directive( 'gjDebugBar', function( Environment )
{
	// Don't show debug bar in production.
	// Return an empty linking function.
	if ( Environment.buildType == 'production' ) {
		return angular.noop;
	}

	return {
		scope: {},
		templateUrl: '/lib/gj-lib-client/components/debug/debug-bar/debug-bar.html',
		controllerAs: 'ctrl',
		controller: function( $scope, $timeout, $interval, $injector, Debug, Screen )
		{
			var _this = this;

			$scope.Screen = Screen;

			this.scopeCount = 0;
			this.watcherCount = 0;
			this.isActive = false;

			function pullCounts()
			{
				_this.scopeCount = Debug.getScopeCount();
				_this.watcherCount = Debug.getWatcherCount();
			}

			$scope.$on( '$stateChangeSuccess', function()
			{
				$timeout( pullCounts );
			} );

			$interval( pullCounts, 2000 );

			if ( $injector.has( 'hotkeys' ) ) {
				$injector.get( 'hotkeys' ).bindTo( $scope )
					.add( {
						combo: 'shift+ctrl+alt+d',
						description: 'Toggle debug bar.',
						callback: function()
						{
							_this.isActive = !_this.isActive;
						},
					} );
			}
			else {
				this.isActive = true;
			}
		}
	};
} );
