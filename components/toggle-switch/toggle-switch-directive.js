angular
	.module('gj.ToggleSwitch')
	.directive('gjToggleSwitch', function($window, $timeout, $parse) {
		var KEY_CODE_SPACE = 32;
		var KEY_CODE_ENTER = 13;

		var CLASS_CHECKED = 'toggle-switch-checked';

		var DRAG_RANGE = 1 / 3;

		return {
			restrict: 'E',
			require: 'ngModel',
			scope: {},
			compile: compile,
			template: require('!html-loader!./toggle-switch.html'),
		};

		function compile(element, attrs) {
			element[0].classList.add('toggle-switch');
			element[0].setAttribute('role', 'checkbox');
			element[0].setAttribute('tabindex', 0);

			return postLink;
		}

		function postLink(scope, element, attrs, ngModelCtrl) {
			var elem = element[0];
			var innerElem = elem.getElementsByClassName('toggle-switch-inner')[0];
			var checked = false;
			var disabledGetter = $parse(attrs.ngDisabled);
			var dragEndTime;

			scope.onText = 'On';
			scope.offText = 'Off';

			if (attrs.ngChecked) {
				scope.$watch(
					scope.$eval.bind(scope, attrs.ngChecked),
					ngModelCtrl.$setViewValue.bind(ngModelCtrl),
				);
			}

			if (angular.isDefined(attrs.ngDisabled)) {
				scope.$watch(disabledGetter, function(isDisabled) {
					elem.setAttribute('tabindex', isDisabled ? -1 : 0);
				});
			}

			if (angular.isDefined(attrs.toggleSwitchOnText)) {
				attrs.$observe('toggleSwitchOnText', function(onText) {
					scope.onText = onText;
				});
			}

			if (angular.isDefined(attrs.toggleSwitchOffText)) {
				attrs.$observe('toggleSwitchOffText', function(offText) {
					scope.offText = offText;
				});
			}

			ngModelCtrl.$formatters.push(format);
			ngModelCtrl.$parsers.push(parse);
			ngModelCtrl.$render = render;
			element.on('click', clickHandler);
			element.on('keypress', keypressHandler);
			scope.dragStart = dragStart;
			scope.drag = drag;
			scope.dragEnd = dragEnd;

			function keypressHandler($event) {
				if ($event.which == KEY_CODE_SPACE || $event.which == KEY_CODE_ENTER) {
					$event.preventDefault();
					clickHandler($event);
				}
			}

			function clickHandler($event) {
				if (elem.hasAttribute('disabled')) {
					return;
				}

				// If we dragged too recently (in ms), then it was probably a ghost click.
				// Prevent it.
				if (Date.now() - dragEndTime < 50) {
					return;
				}

				scope.$apply(function() {
					checked = !checked;
					ngModelCtrl.$setViewValue(checked, $event && $event.type);
					ngModelCtrl.$render();
				});
			}

			function format(value) {
				return !!value;
			}

			function parse(value) {
				return !!value ? true : false;
			}

			function render() {
				checked = ngModelCtrl.$viewValue;
				if (checked) {
					elem.classList.add(CLASS_CHECKED);
				} else {
					elem.classList.remove(CLASS_CHECKED);
				}
			}

			var DRAG_RANGE = 1 / 3;
			var dragWidth = 0;
			var dragDistance = 0;
			function dragStart($event) {
				if (elem.hasAttribute('disabled')) {
					return false;
				}

				elem.classList.add('toggle-switch-dragging');
				dragWidth = elem.offsetWidth;
				dragDistance = 0;
			}

			function drag($event) {
				if (elem.hasAttribute('disabled')) {
					return false;
				}

				var percent = $event.deltaX / dragWidth;
				var translate = ngModelCtrl.$viewValue ? percent : percent - DRAG_RANGE;

				// Between -0.33 and 0.
				translate = Math.max(-DRAG_RANGE, Math.min(0, translate));
				dragDistance = translate;

				innerElem.style.transform =
					'translate3d( ' + 100 * translate + '%, 0, 0 )';
			}

			function dragEnd($event) {
				if (elem.hasAttribute('disabled')) {
					return false;
				}

				elem.classList.remove('toggle-switch-dragging');
				innerElem.style.transform = '';

				// This will take the distance dragged and convert it into
				// a range of 0-1.
				var percent = (DRAG_RANGE + dragDistance) * 3;
				var isChanged = ngModelCtrl.$viewValue ? percent < 0.5 : percent > 0.5;
				if (isChanged) {
					applyModelValue(!ngModelCtrl.$viewValue);
				}

				dragEndTime = Date.now();
			}

			function applyModelValue(value) {
				scope.$apply(function() {
					ngModelCtrl.$setViewValue(value);
					ngModelCtrl.$render();
				});
			}
		}
	});
