angular.module('gj.Form').directive('gjSelectOnFocus', function($timeout) {
	return {
		restrict: 'A',
		link: function(scope, element) {
			element.on('focus', function() {
				// Do it on next iteration, otherwise the click event will cancel the select
				// and set the cursor where they clicked.
				$timeout(
					function() {
						element.select();
					},
					0,
					false,
				); // Don't digest.
			});
		},
	};
});
