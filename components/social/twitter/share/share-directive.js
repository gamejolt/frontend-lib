angular.module( 'gj.Social.Twitter.Share' ).directive( 'gjSocialTwitterShare', function( Twitter_Sdk )
{
	return {
		restrict: 'E',
		scope: true,
		template: '<a href="https://twitter.com/share" class="twitter-share-button" data-url="{{ url }}" data-text="{{ content }}" data-size="{{ size }}">Tweet</a>',
		link: {
			pre: function( scope, element, attrs )
			{
				scope.url = attrs.url;
				scope.content = attrs.content;

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
