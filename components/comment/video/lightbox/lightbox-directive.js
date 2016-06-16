angular.module( 'gj.Comment.Video.Lightbox' ).component( 'gjCommentVideoLightbox', {
	bindings: {
		video: '<',
		onClose: '&',
	},
	templateUrl: '/lib/gj-lib-client/components/comment/video/lightbox/lightbox.html',
	controller: function( $scope, $timeout, $location, App, Environment, Screen, Comment, hotkeys )
	{
		var _this = this;
		this.screen = Screen;

		this.calcMaxDimensions = calcMaxDimensions;
		this.toggleVote = toggleVote;
		this.reply = reply;

		// Can't vote on this comment if...
		// they aren't logged in
		// they wrote the comment
		// the resource belongs to them (they will just upvote stuff that is nice)
		this.canVote = true;
		if ( !App.user ) {
			this.canVote = false;
		}
		else if ( this.video.comment.user.id == App.user.id ) {
			this.canVote = false;
		}
		else if ( this.video.game.developer.id == App.user.id ) {
			this.canVote = false;
		}

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
