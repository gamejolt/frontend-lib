angular.module( 'gj.Social.Twitter.Follow' ).directive( 'gjSocialTwitterFollow', function( Twitter_Sdk )
{
	return {
		restrict: 'E',
		scope: true,
		template: '<a href="https://twitter.com/{{ handle }}" class="twitter-follow-button" data-show-count="{{ showCount }}" data-size="{{ size }}">Follow @{{ handle }}</a>',
		link: {
			pre: function( scope, element, attrs )
			{
				scope.handle = attrs.handle;

				scope.showCount = 'true';
				if ( attrs.showCount && attrs.showCount == 'false' ) {
					scope.showCount = 'false';
				}

				scope.size = 'small';
				if ( attrs.size && attrs.size == 'large' ) {
					scope.size = 'large';
				}
			},
			post: function()
			{
				Twitter_Sdk.load();
			}
		}
	};
} );
