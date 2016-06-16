angular.module( 'gj.Comment.Video.Lightbox' ).component( 'gjCommentVideoLightbox', {
	bindings: {
		video: '<',
		onClose: '&',
	},
	templateUrl: '/lib/gj-lib-client/components/comment/video/lightbox/lightbox.html',
	controller: function( $scope, $timeout, $location, Environment, Screen, Comment, hotkeys )
	{
		var _this = this;
		this.screen = Screen;

		this.calcMaxDimensions = calcMaxDimensions;
		this.toggleVote = toggleVote;
		this.reply = reply;

		this.calcMaxDimensions();

		function calcMaxDimensions()
		{
			if ( Screen.isXs ) {
				this.maxWidth = Screen.width;
				this.maxHeight = Screen.height;
			}
			else {
				this.maxWidth = (Screen.width * 0.8);
				this.maxHeight = Screen.height - (80 * 2);
			}
		};

		function toggleVote()
		{
			// If adding a vote.
			if ( !this.video.comment.userVote ) {
				this.video.comment.$like();
			}
			// If removing a vote.
			else {
				this.video.comment.$removeLike();
			}
		}

		function reply()
		{
			Comment.getCommentUrl( this.video.comment.id ).then( function( url )
			{
				var search = Environment.baseUrl;
				if ( url.search( search ) === 0 ) {
					url = url.replace( search, '' );
				}
				$location.url( url );
				_this.onClose();
			} );
		}

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
