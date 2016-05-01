angular.module( 'gj.User.UserBar' ).directive( 'gjUserBar', function( Environment )
{
	return {
		restrict: 'A',
		replace: true,
		templateUrl: '/lib/gj-lib-client/components/user/user-bar/user-bar.html',
		transclude: true,
		scope: {
			user: '=gjUserBar',
			site: '@gjCurrentSite',
			hideSiteSelector: '=',
		},
		link: function( scope )
		{
			scope.Environment = Environment;

			// User link goes to main site dashboard by default.
			scope.userLink = Environment.baseUrl + '/dashboard';

			// User link on fireside goes to their fireside profile if they are an approved author.
			if ( scope.site == 'fireside' ) {
				scope.$watchGroup( [ 'user.username', 'user.can_manage' ], function()
				{
					if ( !scope.user ) {
						return;
					}

					if ( scope.user.can_manage ) {
						scope.userLink = '/@' + scope.user.username;
					}
					else {
						scope.userLink = Environment.baseUrl + '/dashboard';
					}
				} );
			}
		}
	};
} );
