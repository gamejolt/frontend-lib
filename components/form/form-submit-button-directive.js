angular.module('gj.Form').directive('gjFormSubmitButton', function($animate) {
	return {
		restrict: 'A',
		require: '^gjForm',
		scope: true,
		link: function(scope, element, attrs, gjForm) {
			var successElement = angular.element(
				'<span class="jolticon jolticon-check gj-form-success-icon"></span>',
			);

			scope.$watch('formState.isShowingSuccess', function(shouldShow) {
				if (shouldShow) {
					var children = element.children();
					$animate.enter(
						successElement,
						element,
						children[children.length - 1],
					);
				} else {
					$animate.leave(successElement);
				}
			});
		},
	};
});
