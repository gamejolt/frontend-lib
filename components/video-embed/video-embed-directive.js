angular.module( 'gj.VideoEmbed' ).component( 'gjVideoEmbed', {
	bindings: {
		videoProvider: '@',
		videoId: '<',
		maxVideoHeight: '<?',
		maxVideoWidth: '<?',
		autoplay: '<?',
	},
	templateUrl: '/lib/gj-lib-client/components/video-embed/video-embed.html',
	controller: function( $scope, $element, $sce, $rootScope, Screen, Ruler )
	{
		var VIDEO_RATIO = 0.5625;  // 16:9
		var _this = this;

		this.embedUrl = undefined;

		this.$onChanges = function( changes )
		{
			var url;

			if ( changes.videoId ) {
				if ( this.videoProvider == 'youtube' ) {
					url = 'https://www.youtube.com/embed/' + this.videoId;
				}
				else if ( this.videoProvider == 'vimeo' ) {
					url = 'https://player.vimeo.com/video/' + this.videoId;
				}

				if ( this.autoplay ) {
					url += '?autoplay=1';
				}

				this.embedUrl = $sce.trustAsResourceUrl( url );
			}
		};

		function recalculateDimensions()
		{
			_this.width = Ruler.width( $element[0].getElementsByClassName( 'video-embed-inner' )[0] );

			if ( _this.maxVideoWidth ) {
				_this.width = Math.min( _this.maxVideoWidth, _this.width );
			}

			_this.height = _this.width * VIDEO_RATIO;

			if ( _this.maxVideoHeight && _this.height > _this.maxVideoHeight ) {
				_this.height = _this.maxVideoHeight;
				_this.width = _this.height / VIDEO_RATIO;
			}
		};

		recalculateDimensions();
		Screen.setResizeSpy( $scope, recalculateDimensions );
	}
} );
