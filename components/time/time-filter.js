angular.module('gj.Time').filter('time', function() {
	return function(time) {
		if (angular.isDefined(time)) {
			// Because I'm too stupid to write unit tests.
			// time = 8.456456;  // Should be 0:08
			// time = 18.456456;  // Should be 0:18
			// time = 78.4654;  // Should be 1:18
			// time = 1078.4654;  // Should be 17:58

			var minutes = Math.floor(time / 60);
			var seconds = Math.floor(time % 60);

			if (seconds < 10) {
				seconds = '0' + seconds;
			}

			return minutes + ':' + seconds;
		} else {
			return '';
		}
	};
});
