import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import * as View from '!view!./timepicker.html?style=./timepicker.styl';
import { AppJolticon } from '../../vue/components/jolticon/jolticon';
import { AppFormControl } from '../form-vue/control/control';

@View
@Component({
	components: {
		AppJolticon,
		AppFormControl,
	},
})
export class AppTimepicker extends Vue {
	@Prop(Date) value?: Date;
	@Prop({ type: Number, default: 1 })
	hourStep: number;
	@Prop({ type: Number, default: 1 })
	minuteStep: number;
	@Prop({ type: Boolean, default: true })
	showMeridian: boolean;
	@Prop(Array) meridians?: [string, string];
	@Prop(Boolean) readonlyInput: boolean;

	selected: Date = null as any;
	hours = '';
	minutes = '';
	meridian = '';
	invalidHours = false;
	invalidMinutes = false;

	// The component assumed it is a form, but since it isn't anymore, validity is a simple boolean.
	// Embedding forms can watch on this value to use in their own validity filters or whatever.
	valid = true;

	$refs: {
		hours: HTMLInputElement;
		minutes: HTMLInputElement;
	};

	private get _meridians() {
		return this.meridians || [this.$gettext('AM'), this.$gettext('PM')];
	}

	created() {
		this.selected = this.value || new Date();
		if (this.selected !== this.value) {
			this.$emit('input', this.selected);
		}
	}

	mounted() {
		this.$refs.hours.addEventListener('blur', () => {
			if (!this.invalidHours && parseInt(this.hours, 10) < 10) {
				this.hours = this.pad(this.hours);
			}
		});

		this.$refs.minutes.addEventListener('blur', () => {
			if (!this.invalidMinutes && parseInt(this.minutes, 10) < 10) {
				this.minutes = this.pad(this.minutes);
			}
		});

		this.makeValid();
		this.updateTemplate();
	}

	private invalidate(hours: boolean | null, minutes: boolean | null) {
		// TODO: should set selected to null?
		this.$emit('input', null);

		this.valid = false;
		if (hours !== null) {
			this.invalidHours = hours;
		}
		if (minutes !== null) {
			this.invalidMinutes = minutes;
		}
	}

	updateHours() {
		if (this.readonlyInput) {
			return;
		}

		const hours = this.getHoursFromTemplate();

		if (hours !== undefined) {
			this.selected.setHours(hours);
			this.refresh('h');
		} else {
			this.invalidate(true, null);
		}
	}

	updateMinutes() {
		if (this.readonlyInput) {
			return;
		}

		const minutes = this.getMinutesFromTemplate();

		if (minutes !== undefined) {
			this.selected.setMinutes(minutes);
			this.refresh('m');
		} else {
			this.invalidate(null, true);
		}
	}

	// Get $scope.hours in 24H mode if valid
	getHoursFromTemplate() {
		let hours = parseInt(this.hours, 10);
		const valid = this.showMeridian ? hours > 0 && hours < 13 : hours >= 0 && hours < 24;
		if (!valid) {
			return undefined;
		}

		if (this.showMeridian) {
			if (hours === 12) {
				hours = 0;
			}
			if (this.meridian === this._meridians[1]) {
				hours = hours + 12;
			}
		}
		return hours;
	}

	getMinutesFromTemplate() {
		const minutes = parseInt(this.minutes, 10);
		return minutes >= 0 && minutes < 60 ? minutes : undefined;
	}

	pad(value: any) {
		return value && value.toString().length < 2 ? '0' + value : value + '';
	}

	// TODO figure out what to do with setViewValue
	// Call internally when we know that model is valid.
	refresh(keyboardChange?: 'h' | 'm') {
		this.makeValid();
		this.$emit('input', this.selected);
		this.updateTemplate(keyboardChange);
	}

	makeValid() {
		this.valid = true;
		this.invalidHours = false;
		this.invalidMinutes = false;
	}

	updateTemplate(keyboardChange?: 'h' | 'm') {
		let hours = this.selected.getHours(),
			minutes = this.selected.getMinutes();

		if (this.showMeridian) {
			hours = hours === 0 || hours === 12 ? 12 : hours % 12; // Convert 24 to 12 hour system
		}

		this.hours = keyboardChange === 'h' ? hours + '' : this.pad(hours);
		this.minutes = keyboardChange === 'm' ? minutes + '' : this.pad(minutes);
		this.meridian = this.selected.getHours() < 12 ? this._meridians[0] : this._meridians[1];
	}

	addMinutes(minutes: number) {
		const dt = new Date(this.selected.getTime() + minutes * 60000);
		this.selected.setHours(dt.getHours(), dt.getMinutes());
		this.refresh();
	}

	incrementHours() {
		this.addMinutes(this.hourStep * 60);
	}

	decrementHours() {
		this.addMinutes(-this.hourStep * 60);
	}

	incrementMinutes() {
		this.addMinutes(this.minuteStep);
	}

	decrementAAQQMinutes() {
		this.addMinutes(-this.minuteStep);
	}

	toggleMeridian() {
		this.addMinutes(12 * 60 * (this.selected.getHours() < 12 ? 1 : -1));
	}

	@Watch('showMeridian')
	onShowMeridianChanged() {
		if (!this.valid) {
			// Evaluate from template
			const hours = this.getHoursFromTemplate(),
				minutes = this.getMinutesFromTemplate();
			if (hours !== undefined && minutes !== undefined) {
				this.selected.setHours(hours);
				this.refresh();
			}
		} else {
			this.updateTemplate();
		}
	}
}

// angular
// 	.module('ui.bootstrap.timepicker', [])
// 	.constant('timepickerConfig', {
// 		hourStep: 1,
// 		minuteStep: 1,
// 		showMeridian: true,
// 		meridians: null,
// 		readonlyInput: false,
// 		mousewheel: true,
// 	})
// 	.controller('TimepickerController', [
// 		'$scope',
// 		'$attrs',
// 		'$parse',
// 		'$log',
// 		'$locale',
// 		'timepickerConfig',
// 		function($scope, $attrs, $parse, $log, $locale, timepickerConfig) {
// 			var selected = new Date(),
// 				ngModelCtrl = { $setViewValue: angular.noop }, // nullModelCtrl
// 				meridians = angular.isDefined($attrs.meridians)
// 					? $scope.$parent.$eval($attrs.meridians)
// 					: timepickerConfig.meridians || $locale.DATETIME_FORMATS.AMPMS;

// 			this.init = function(ngModelCtrl_, inputs) {
// 				ngModelCtrl = ngModelCtrl_;
// 				ngModelCtrl.$render = this.render;

// 				var hoursInputEl = inputs.eq(0),
// 					minutesInputEl = inputs.eq(1);

// 				var mousewheel = angular.isDefined($attrs.mousewheel)
// 					? $scope.$parent.$eval($attrs.mousewheel)
// 					: timepickerConfig.mousewheel;
// 				if (mousewheel) {
// 					this.setupMousewheelEvents(hoursInputEl, minutesInputEl);
// 				}

// 				$scope.readonlyInput = angular.isDefined($attrs.readonlyInput)
// 					? $scope.$parent.$eval($attrs.readonlyInput)
// 					: timepickerConfig.readonlyInput;
// 				this.setupInputEvents(hoursInputEl, minutesInputEl);
// 			};

// 			var hourStep = timepickerConfig.hourStep;
// 			if ($attrs.hourStep) {
// 				$scope.$parent.$watch($parse($attrs.hourStep), function(value) {
// 					hourStep = parseInt(value, 10);
// 				});
// 			}

// 			var minuteStep = timepickerConfig.minuteStep;
// 			if ($attrs.minuteStep) {
// 				$scope.$parent.$watch($parse($attrs.minuteStep), function(value) {
// 					minuteStep = parseInt(value, 10);
// 				});
// 			}

// 			// 12H / 24H mode
// 			$scope.showMeridian = timepickerConfig.showMeridian;
// 			if ($attrs.showMeridian) {
// 				$scope.$parent.$watch($parse($attrs.showMeridian), function(value) {
// 					$scope.showMeridian = !!value;

// 					if (ngModelCtrl.$error.time) {
// 						// Evaluate from template
// 						var hours = getHoursFromTemplate(),
// 							minutes = getMinutesFromTemplate();
// 						if (angular.isDefined(hours) && angular.isDefined(minutes)) {
// 							selected.setHours(hours);
// 							refresh();
// 						}
// 					} else {
// 						updateTemplate();
// 					}
// 				});
// 			}

// 			// Get $scope.hours in 24H mode if valid
// 			function getHoursFromTemplate() {
// 				var hours = parseInt($scope.hours, 10);
// 				var valid = $scope.showMeridian ? hours > 0 && hours < 13 : hours >= 0 && hours < 24;
// 				if (!valid) {
// 					return undefined;
// 				}

// 				if ($scope.showMeridian) {
// 					if (hours === 12) {
// 						hours = 0;
// 					}
// 					if ($scope.meridian === this._meridians[1]) {
// 						hours = hours + 12;
// 					}
// 				}
// 				return hours;
// 			}

// 			function getMinutesFromTemplate() {
// 				var minutes = parseInt($scope.minutes, 10);
// 				return minutes >= 0 && minutes < 60 ? minutes : undefined;
// 			}

// 			function pad(value) {
// 				return angular.isDefined(value) && value.toString().length < 2 ? '0' + value : value;
// 			}

// 			// Respond on mousewheel spin
// 			this.setupMousewheelEvents = function(hoursInputEl, minutesInputEl) {
// 				var isScrollingUp = function(e) {
// 					if (e.originalEvent) {
// 						e = e.originalEvent;
// 					}
// 					//pick correct delta variable depending on event
// 					var delta = e.wheelDelta ? e.wheelDelta : -e.deltaY;
// 					return e.detail || delta > 0;
// 				};

// 				hoursInputEl.bind('mousewheel wheel', function(e) {
// 					$scope.$apply(isScrollingUp(e) ? $scope.incrementHours() : $scope.decrementHours());
// 					e.preventDefault();
// 				});

// 				minutesInputEl.bind('mousewheel wheel', function(e) {
// 					$scope.$apply(isScrollingUp(e) ? $scope.incrementMinutes() : $scope.decrementMinutes());
// 					e.preventDefault();
// 				});
// 			};

// 			this.setupInputEvents = function(hoursInputEl, minutesInputEl) {
// 				if ($scope.readonlyInput) {
// 					$scope.updateHours = angular.noop;
// 					$scope.updateMinutes = angular.noop;
// 					return;
// 				}

// 				var invalidate = function(invalidHours, invalidMinutes) {
// 					ngModelCtrl.$setViewValue(null);
// 					ngModelCtrl.$setValidity('time', false);
// 					if (angular.isDefined(invalidHours)) {
// 						$scope.invalidHours = invalidHours;
// 					}
// 					if (angular.isDefined(invalidMinutes)) {
// 						$scope.invalidMinutes = invalidMinutes;
// 					}
// 				};

// 				$scope.updateHours = function() {
// 					var hours = getHoursFromTemplate();

// 					if (angular.isDefined(hours)) {
// 						selected.setHours(hours);
// 						refresh('h');
// 					} else {
// 						invalidate(true);
// 					}
// 				};

// 				hoursInputEl.bind('blur', function(e) {
// 					if (!$scope.invalidHours && $scope.hours < 10) {
// 						$scope.$apply(function() {
// 							$scope.hours = pad($scope.hours);
// 						});
// 					}
// 				});

// 				$scope.updateMinutes = function() {
// 					var minutes = getMinutesFromTemplate();

// 					if (angular.isDefined(minutes)) {
// 						selected.setMinutes(minutes);
// 						refresh('m');
// 					} else {
// 						invalidate(undefined, true);
// 					}
// 				};

// 				minutesInputEl.bind('blur', function(e) {
// 					if (!$scope.invalidMinutes && $scope.minutes < 10) {
// 						$scope.$apply(function() {
// 							$scope.minutes = pad($scope.minutes);
// 						});
// 					}
// 				});
// 			};

// 			this.render = function() {
// 				var date = ngModelCtrl.$modelValue ? new Date(ngModelCtrl.$modelValue) : null;

// 				if (isNaN(date)) {
// 					ngModelCtrl.$setValidity('time', false);
// 					$log.error(
// tslint:disable-next-line:max-line-length
// 						'Timepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.'
// 					);
// 				} else {
// 					if (date) {
// 						selected = date;
// 					}
// 					makeValid();
// 					updateTemplate();
// 				}
// 			};

// 			// Call internally when we know that model is valid.
// 			function refresh(keyboardChange) {
// 				makeValid();
// 				ngModelCtrl.$setViewValue(new Date(selected));
// 				updateTemplate(keyboardChange);
// 			}

// 			function makeValid() {
// 				ngModelCtrl.$setValidity('time', true);
// 				$scope.invalidHours = false;
// 				$scope.invalidMinutes = false;
// 			}

// 			function updateTemplate(keyboardChange) {
// 				var hours = selected.getHours(),
// 					minutes = selected.getMinutes();

// 				if ($scope.showMeridian) {
// 					hours = hours === 0 || hours === 12 ? 12 : hours % 12; // Convert 24 to 12 hour system
// 				}

// 				$scope.hours = keyboardChange === 'h' ? hours : pad(hours);
// 				$scope.minutes = keyboardChange === 'm' ? minutes : pad(minutes);
// 				$scope.meridian = selected.getHours() < 12 ? this._meridians[0] : this._meridians[1];
// 			}

// 			function addMinutes(minutes) {
// 				var dt = new Date(selected.getTime() + minutes * 60000);
// 				selected.setHours(dt.getHours(), dt.getMinutes());
// 				refresh();
// 			}

// 			$scope.incrementHours = function() {
// 				addMinutes(hourStep * 60);
// 			};
// 			$scope.decrementHours = function() {
// 				addMinutes(-hourStep * 60);
// 			};
// 			$scope.incrementMinutes = function() {
// 				addMinutes(minuteStep);
// 			};
// 			$scope.decrementMinutes = function() {
// 				addMinutes(-minuteStep);
// 			};
// 			$scope.toggleMeridian = function() {
// 				addMinutes(12 * 60 * (selected.getHours() < 12 ? 1 : -1));
// 			};
// 		},
// 	])
// 	.directive('timepicker', function() {
// 		return {
// 			restrict: 'EA',
// 			require: ['timepicker', '?^ngModel'],
// 			controller: 'TimepickerController',
// 			replace: true,
// 			scope: {},
// 			templateUrl: 'template/timepicker/timepicker.html',
// 			link: function(scope, element, attrs, ctrls) {
// 				var timepickerCtrl = ctrls[0],
// 					ngModelCtrl = ctrls[1];

// 				if (ngModelCtrl) {
// 					timepickerCtrl.init(ngModelCtrl, element.find('input'));
// 				}
// 			},
// 		};
// 	});
