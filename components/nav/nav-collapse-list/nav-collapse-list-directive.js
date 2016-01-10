angular.module( 'gj.Nav.NavCollapseList' ).directive( 'gjNavCollapseList', function()
{
	return {
		restrict: 'E',
		templateUrl: '/lib/gj-lib-client/components/nav/nav-collapse-list/nav-collapse-list.html',
		scope: {},
		transclude: true,
		link: function( scope, elem )
		{
			scope.isOpen = false;

			scope.$on( '$stateChangeSuccess', function()
			{
				scope.isOpen = false;
			} );
		}
	};
} );