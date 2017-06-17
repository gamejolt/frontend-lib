angular.module('gj.Form').directive('controlError', function($interpolate) {
	return {
		restrict: 'EA',
		require: '^controlErrors',
		scope: {
			when: '@',
		},
		link: function(scope, element, attrs, controlErrors) {
			controlErrors.setMessageOverride(
				scope.when,
				$interpolate(element.text())(scope.$parent),
			);
		},
	};
});
