angular.module( 'gj.Debug' ).service( 'Debug', function()
{
	this.getWatcherCount = function()
	{
		var watcherCount = 0;
		var checkedScopes = {};
		var elements = document.all;
		var elementCount = elements.length;

		for ( var i = 0; i < elementCount; ++i ) {
			var scope = angular.element( elements[i] ).scope();
			if ( scope && !checkedScopes[ scope.$id ] && scope.$$watchers && scope.$$watchers.length ) {
				checkedScopes[ scope.$id ] = true;
				watcherCount += scope.$$watchers.length;
			}
		};

		return watcherCount;
	};

	this.getScopeCount = function()
	{
		var checkedScopes = {};
		var elements = document.all;
		var elementCount = elements.length;

		for ( var i = 0; i < elementCount; ++i ) {
			var scope = angular.element( elements[i] ).scope();
			if ( scope ) {
				checkedScopes[ scope.$id ] = true;
			}
		};

		return _.size( checkedScopes );
	};
} );
