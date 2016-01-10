angular.module( 'gj.Social.Facebook.Share' ).directive( 'gjSocialFacebookShare', function( Facebook_Sdk )
{
	return {
		restrict: 'E',
		scope: true,
		template: '<div class="fb-share-button" data-href="{{ url }}" data-layout="button"></div>',
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
