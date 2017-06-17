// http://zachsnow.com/#!/blog/2014/angularjs-faster-ng-include/
angular.module('gj.Partial').directive('gjPartial', function($templateCache) {
	return {
		restrict: 'A',
		priority: 400, // Same as ng-include.
		compile: function(element, attrs) {
			var templateName = attrs.gjPartial;
			if (!templateName) {
				throw new Error('gjPartial: expected template name');
			}

			var template = $templateCache.get(templateName);
			if (angular.isUndefined(template)) {
				throw new Error('gjPartial: unknown template ' + templateName);
			}

			element.html(template);
		},
	};
});
