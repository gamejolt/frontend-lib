angular.module('gj.Duration').filter('duration', function($window) {
	if (!$window.humanizeDuration) {
		throw new Error('humanize-duration could not be found.');
	}

	var humanizer = $window.humanizeDuration.humanizer({
		language: 'shortEn',
		languages: {
			shortEn: {
				y: function() {
					return 'y';
				},
				mo: function() {
					return 'mo';
				},
				w: function() {
					return 'w';
				},
				d: function() {
					return 'd';
				},
				h: function() {
					return 'h';
				},
				m: function() {
					return 'm';
				},
				s: function() {
					return 's';
				},
				ms: function() {
					return 'ms';
				},
			},
		},
	});

	return function(time) {
		if (angular.isDefined(time)) {
			return humanizer(time * 1000, {
				delimiter: ', ',
				spacer: '',
				units: ['d', 'h', 'm', 's'],
				round: true,
			});
		} else {
			return '';
		}
	};
});
