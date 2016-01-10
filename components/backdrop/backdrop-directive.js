angular.module( 'gj.Backdrop' ).directive( 'gjBackdrop', function( App )
{
	return {
		scope: {
			onClick: '&?backdropOnClick',
		},
		template: '<div class="backdrop" ng-class="{ in: animate }" ng-click="clicked()"></div>',
		link: function( scope )
		{
			scope.animate = true;

			scope.clicked = function()
			{
				if ( scope.onClick ) {
					scope.onClick( {} );
				}
			};
		}
	};
} );
