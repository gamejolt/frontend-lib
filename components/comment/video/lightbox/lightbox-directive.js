angular.module( 'gj.Comment.Video.Lightbox' ).component( 'gjCommentVideoLightbox', {
	bindings: {
		video: '<',
		onClose: '&',
	},
	templateUrl: '/lib/gj-lib-client/components/comment/video/lightbox/lightbox.html',
	controller: function( $scope, $timeout, Screen, hotkeys )
	{
		var _this = this;

		this.calcMaxDimensions = calcMaxDimensions;

		this.calcMaxDimensions();

		function calcMaxDimensions()
		{
			this.maxWidth = (Screen.windowWidth * 0.8);
			this.maxHeight = Screen.windowHeight - (80 * 2);
		};

		Screen.setResizeSpy( $scope, function()
		{
			_this.calcMaxDimensions();
		} );

		hotkeys.bindTo( $scope )
			.add( {
				combo: 'esc',
				description: 'Close video lightbox.',
				callback: function( $event )
				{
					_this.onClose();
					$event.preventDefault();
				}
			} );
	}
} );
