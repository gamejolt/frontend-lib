angular.module( 'gj.Social.Facebook.Send' ).directive( 'gjSocialFacebookSend', function( Facebook_Sdk )
{
	return {
		restrict: 'E',
		scope: true,
		template: '<div class="fb-send" data-href="{{ url }}"></div>',
		link: {
			pre: function( scope, element, attrs )
			{
				scope.url = attrs.url;
			},
			post: function()
			{
				Facebook_Sdk.load();
			}
		}
	};
} );
