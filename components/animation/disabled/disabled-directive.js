angular
	.module('gj.Animation.Disabled')
	.directive('gjAnimationDisabled', function($animate, $parse) {
		return {
			restrict: 'A',
			link: function(scope, element, attrs) {
				if (!attrs.gjAnimationDisabled) {
					disable();
				} else {
					scope.$watch($parse(attrs.gjAnimationDisabled), function(isDisabled) {
						isDisabled ? disable() : enable();
					});
				}

				function disable() {
					$animate.enabled(element, false);
				}

				function enable() {
					$animate.enabled(element, true);
				}
			},
		};
	});
