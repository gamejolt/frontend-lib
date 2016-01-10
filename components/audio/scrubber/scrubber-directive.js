angular.module( 'gj.Audio.Scrubber' ).directive( 'gjAudioScrubber', function()
{
	return {
		scope: {
			song: '=song',
			currentTime: '=?songCurrentTime',
			duration: '=?songDuration',
		},
		templateUrl: '/lib/gj-lib-client/components/audio/scrubber/scrubber.html',
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function( $scope, $element )
		{
			var _this = this;

			this.unfilledRight = 'auto';

			$scope.$watch( 'ctrl.currentTime', function()
			{
				if ( !_this.duration ) {
					_this.unfilledRight = 'auto';
				}
				else {
					_this.unfilledRight = 100 - (_this.currentTime / _this.duration * 100) + '%';
				}
			} );
		}
	};
} );
