angular.module( 'gj.Nav.NavCollapseList' ).directive( 'gjNavCollapseList', function()
{
	return {
		restrict: 'E',
		template: require( '!html-loader!./nav-collapse-list.html' ),
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