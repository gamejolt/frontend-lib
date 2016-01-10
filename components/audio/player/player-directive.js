angular.module( 'gj.Audio.Player' ).directive( 'gjAudioPlayer', function( $timeout, $interval, $sce )
{
	return {
		template: '<audio ng-src="{{ ctrl.trustedSrc }}" preload="auto"></audio>',
		scope: {
			song: '=song',
			currentTime: '=?songCurrentTime',
			duration: '=?songDuration',
			onSongEnded: '&?onSongEnded',
		},
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function( $scope, $element )
		{
			var _this = this;
			var audioElem = $element.children()[0];

			var endWatcher;

			this.trustedSrc = '';

			function onSongEnded( sendEvent )
			{
				clearWatcher();

				if ( sendEvent && _this.onSongEnded ) {
					_this.onSongEnded( {} );
				}
			}

			function setWatcher()
			{
				endWatcher = $interval( function()
				{
					if ( audioElem.ended ) {
						onSongEnded( true );
					}
					else {
						_this.currentTime = audioElem.currentTime;
						_this.duration = audioElem.duration;
					}
				}, 250 );
			}

			function clearWatcher()
			{
				if ( endWatcher ) {
					$interval.cancel( endWatcher );
					endWatcher = undefined;
				}
			}

			$scope.$watch( 'ctrl.song.url', function( src )
			{
				clearWatcher();

				if ( src ) {
					_this.trustedSrc = $sce.trustAsResourceUrl( src );

					// Wait for the src to be posted to the DOM.
					$timeout( function()
					{
						audioElem.play();
					}, 0, false );

					setWatcher();
				}
				else {
					audioElem.pause();
					_this.trustedSrc = '';
				}
			} );

			$scope.$on( '$destroy', function()
			{
				clearWatcher();
			} );
		}
	};
} );
