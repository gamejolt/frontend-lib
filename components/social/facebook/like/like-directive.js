angular.module( 'gj.Social.Facebook.Like' ).directive( 'gjSocialFacebookLike', function( Facebook_Sdk )
{
	return {
		restrict: 'E',
		scope: true,
		template: '<div class="fb-like" ng-attr-data-href="{{ url }}" data-layout="button_count" data-action="like" data-show-faces="false" data-share="{{ showShare }}"></div>',
		link: {
			pre: function( scope, element, attrs )
			{
				// It's okay if it's undefined.
				scope.url = attrs.url;

				scope.showShare = 'true';
				if ( attrs.showShare == 'false' ) {
					scope.showShare = 'false';
				}
			},
			post: function()
			{
				Facebook_Sdk.load();
			}
		}
	};
} );
