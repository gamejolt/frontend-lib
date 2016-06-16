angular.module( 'gj.Social.Youtube.Subscribe' ).component( 'gjSocialYoutubeSubscribe', {
	bindings: {
		channel: '@',
		layout: '@?',
		theme: '@?',
	},
	template: '<div class="g-ytsubscribe" data-channel="{{ ::$ctrl.channel }}" data-layout="{{ ::$ctrl.layout }}" data-theme="{{ ::$ctrl.theme }}" data-count="default"></div>',
	controller: function( Youtube_Sdk )
	{
		if ( !this.layout ) {
			this.layout = 'default';
		}

		if ( !this.theme ) {
			this.theme = 'default';
		}

		this.$postLink = function()
		{
			Youtube_Sdk.load();
		};
	},
} );
