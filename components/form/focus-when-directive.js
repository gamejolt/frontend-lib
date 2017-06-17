angular.module('gj.Form').directive('gjFocusWhen', function($timeout, $parse) {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			function focusElement() {
				// Don't do a dirty check after.
				$timeout(
					function() {
						element[0].focus();
					},
					0,
					false
				);
			}

			// If the attribute wasn't passed in, then we just want to focus whenever
			// this element is initially created.
			if (!attrs.gjFocusWhen) {
				focusElement();
			} else {
				// Otherwise set up a watch to check when to focus this element.
				scope.$watch($parse(attrs.gjFocusWhen), function(newVal, oldVal) {
					if (newVal) {
						focusElement();
					}
				});
			}
		},
	};
});
