angular
	.module('gj.Tooltip')
	.directive('gjTooltip', function($compile, $interpolate, Screen) {
		return {
			priority: 100000,
			terminal: true,
			restrict: 'A',
			scope: true,
			link: {
				pre: function(scope, element, attrs) {
					// Ensure Screen is on the scope.
					if (!scope.Screen) {
						scope.Screen = Screen;
					}

					// Remove this directive so that we don't go in an infinite loop.
					element.removeAttr('gj-tooltip');

					scope._tooltip = '';
					var interpolated = $interpolate(attrs.gjTooltip);
					scope.$watch(
						function() {
							return interpolated(scope.$parent);
						},
						function(val) {
							scope._tooltip = val;
						}
					);

					// Add the tooltip stuff, yo.
					element.attr('tooltip', '{{ (!Screen.isXs ? (_tooltip) : "") }}');

					// Recompile the element with the new attributes.
					$compile(element)(scope);
				},
			},
		};
	});
