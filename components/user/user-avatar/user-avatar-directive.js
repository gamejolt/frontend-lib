angular.module( 'gj.User.UserAvatar' ).directive( 'gjUserAvatar', function( Environment )
{
	return {
		restrict: 'A',
		template: require( '!html-loader!./user-avatar.html' ),
		scope: {
			user: '=gjUserAvatar',
			avatarLink: '@?',
			avatarShowName: '=?'
		},
		link: function( scope )
		{
			scope.href = '';

			if ( scope.user ) {
				if ( !scope.avatarLink ) {
					scope.href = Environment.wttfBaseUrl + scope.user.url;
				}
				else if ( scope.avatarLink == 'dashboard' ) {
					scope.href = Environment.wttfBaseUrl + '/dashboard';
				}
				else if ( scope.avatarLink == 'fireside' ) {
					scope.href = Environment.firesideBaseUrl + '/@' + scope.user.username;
				}
			}
		}
	};
} );
