angular.module( 'gj.HistoryTick' ).directive( 'gjHistoryTick', function( Environment )
{
	return {
		restrict: 'AE',
		template: '<img class="pixel" ng-if="!Environment.isPrerender" ng-src="{{ ::Environment.apiHost }}/tick/{{ ::historyTickResource }}/{{ historyTickResourceId }}" width="0" height="0" alt="">',
		scope: {
			historyTickResource: '@',
			historyTickResourceId: '='
		},
		compile: function( element )
		{
			element.addClass( 'pixel' );

			return function( scope )
			{
				scope.Environment = Environment;
			};
		}
	};
} );
