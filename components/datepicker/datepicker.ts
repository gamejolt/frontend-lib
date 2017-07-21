import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./datepicker.html?style=./datepicker.styl';
import { AppDaypicker } from './day';
import { date as dateFilter } from '../../vue/filters/date';
import { AppMonthpicker } from './month';
import { AppYearpicker } from './year';

type DateMode = 'day' | 'month' | 'year';

export interface DateObj {
	date: Date;
	label: string;
	selected: boolean;
	disabled: boolean;
	current: boolean;

	uid?: string;
	secondary?: boolean;
}

// interface Picker {
// 	component: AppDaypicker /* | AppMonthPicker | AppYearPicker */;
// 	refreshView: () => void;
// 	compare: ( date1: Date, date2: Date ) => number;
// 	handleKeyDown: ( name: string, evt: KeyboardEvent ) => void;
// }

@View
@Component({
	components: {
		AppDaypicker,
		AppMonthpicker,
		AppYearpicker,
	},
})
export class AppDatepicker extends Vue {
	@Prop(Date) value: Date | null;
	@Prop({ type: String, default: 'D' })
	formatDay: string;
	@Prop({ type: String, default: 'MMMM' })
	formatMonth: string;
	@Prop({ type: String, default: 'YYYY' })
	formatYear: string;
	@Prop({ type: String, default: 'ddd' })
	formatDayHeader: string;
	@Prop({ type: String, default: 'MMMM YYYY' })
	formatDayTitle: string;
	@Prop({ type: String, default: 'YYYY' })
	formatMonthTitle: string;
	@Prop({ type: String, default: 'day' })
	mode: DateMode;
	@Prop({ type: String, default: 'day' })
	minMode: DateMode;
	@Prop({ type: String, default: 'year' })
	maxMode: DateMode;
	@Prop({ type: Boolean, default: true })
	showWeeks: boolean;
	@Prop({ type: Number, default: 0 })
	startingDay: number;
	@Prop({ type: Number, default: 20 })
	yearRange: number;
	@Prop({ type: Date, default: null })
	minDate: Date;
	@Prop({ type: Date, default: null })
	maxDate: Date;
	@Prop(Date) initDate?: Date;
	@Prop(Function) dateDisabled?: (obj: { date: Date; mode: DateMode }) => any;

	modes: DateMode[] = ['day', 'month', 'year'];
	uniqueId = '';
	activeDate: Date = null as any;
	activeDateId? = '';
	dateValid = false;
	dateDisabledValid = false;
	datepickerMode: DateMode = null as any;
	activePicker?: AppDaypicker | AppMonthpicker | AppYearpicker;

	// Key event mapper
	readonly keys: { [keyCode: number]: string } = {
		13: 'enter',
		32: 'space',
		33: 'pageup',
		34: 'pagedown',
		35: 'end',
		36: 'home',
		37: 'left',
		38: 'up',
		39: 'right',
		40: 'down',
	};

	created() {
		this.uniqueId = 'datepicker-' + Math.floor(Math.random() * 10000);
		this.activeDate = this.initDate || new Date();
		this.datepickerMode = this.mode;
	}

	isActive(dateObj: DateObj) {
		if (!this.activePicker) {
			return false;
		}

		if (this.activePicker.compare(dateObj.date, this.activeDate) === 0) {
			this.activeDateId = dateObj.uid;
			return true;
		}
		return false;
	}

	onPickerActive(picker: AppDaypicker) {
		this.activePicker = picker;
	}

	render() {
		if (this.value) {
			// const date = new Date(this.value),
			// 	isValid = !isNaN(date);

			// if (isValid) {
			// 	this.activeDate = date;
			// } else {
			// 	$log.error(
			// 		'Datepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.'
			// 	);
			// }

			this.activeDate = new Date(this.value);
			this.dateValid = true;
		}
		this.refreshView();
	}

	refreshView() {
		if (this.activePicker && this.activePicker.$el) {
			this.activePicker.refreshView();

			const date = this.value ? new Date(this.value) : null;
			this.dateDisabledValid = !date || !this.isDisabled(date);
		}
	}

	createDateObject(date: Date, format: string): DateObj {
		const model = this.value ? new Date(this.value) : null;
		return {
			date: date,
			label: dateFilter(date, format),
			selected: !!model && this.activePicker!.compare(date, model) === 0,
			disabled: this.isDisabled(date),
			current: this.activePicker!.compare(date, new Date()) === 0,
		};
	}

	isDisabled(date: Date) {
		if (!this.activePicker) {
			return true;
		}

		return (
			(this.minDate && this.activePicker.compare(date, this.minDate) < 0) ||
			(this.maxDate && this.activePicker.compare(date, this.maxDate) > 0) ||
			(this.dateDisabled && this.dateDisabled({ date: date, mode: this.datepickerMode }))
		);
	}

	// Submits the date and moves to the next step (year -> month -> date).
	// If finished the date step emit the date to mutate the model value.
	select(date: Date) {
		if (this.datepickerMode === this.minMode) {
			const dt = this.value ? new Date(this.value) : new Date(0, 0, 0, 0, 0, 0, 0);
			dt.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
			this.$emit('input', dt);
			//ngModelCtrl.$render();
		} else {
			this.activeDate = date;
			this.datepickerMode = this.modes[this.modes.indexOf(this.datepickerMode) - 1];
		}
	}

	moveYears(direction: -1 | 1) {
		const year = this.activeDate.getFullYear() + direction;
		const month = this.activeDate.getMonth();
		this.activeDate.setFullYear(year, month, 1);
		this.refreshView();
	}

	toggleMode(direction?: -1 | 1) {
		direction = direction || 1;

		if (
			(this.datepickerMode === this.maxMode && direction === 1) ||
			(this.datepickerMode === this.minMode && direction === -1)
		) {
			return;
		}

		this.datepickerMode = this.modes[this.modes.indexOf(this.datepickerMode) + direction];
	}

	focusElement(): void {
		this.$nextTick(() => {
			(this.$el.firstElementChild! as HTMLElement).focus();
		});
	}

	// Listen for focus requests from popup directive
	// TODO might not need this - popup isn't used?
	// $scope.$on('datepicker.focus', focusElement);

	keydown(evt: KeyboardEvent) {
		const key = this.keys[evt.which];

		if (!key || evt.shiftKey || evt.altKey) {
			return;
		}

		evt.preventDefault();
		evt.stopPropagation();

		if (key === 'enter' || key === 'space') {
			if (this.isDisabled(this.activeDate)) {
				return; // do nothing
			}
			this.select(this.activeDate);
			this.focusElement();
		} else if (evt.ctrlKey && (key === 'up' || key === 'down')) {
			this.toggleMode(key === 'up' ? 1 : -1);
			this.focusElement();
		} else if (this.activePicker) {
			this.activePicker.handleKeyDown(key, evt);
			this.refreshView();
		}
	}
}

// angular
// 	.module('ui.bootstrap.datepicker', ['ui.bootstrap.dateparser', 'ui.bootstrap.position'])
// 	// .constant('datepickerConfig', {
// 	// 	formatDay: 'dd',
// 	// 	formatMonth: 'MMMM',
// 	// 	formatYear: 'yyyy',
// 	// 	formatDayHeader: 'EEE',
// 	// 	formatDayTitle: 'MMMM yyyy',
// 	// 	formatMonthTitle: 'yyyy',
// 	// 	datepickerMode: 'day',
// 	// 	minMode: 'day',
// 	// 	maxMode: 'year',
// 	// 	showWeeks: true,
// 	// 	startingDay: 0,
// 	// 	yearRange: 20,
// 	// 	minDate: null,
// 	// 	maxDate: null,
// 	// })
// 	// .controller('DatepickerController', [
// 	// 	'$scope',
// 	// 	'$attrs',
// 	// 	'$parse',
// 	// 	'$interpolate',
// 	// 	'$timeout',
// 	// 	'$log',
// 	// 	'dateFilter',
// 	// 	'datepickerConfig',
// 		function($scope, $attrs, $parse, $interpolate, $timeout, $log, dateFilter, datepickerConfig) {
// 			var self = this,
// 				ngModelCtrl = { $setViewValue: angular.noop }; // nullModelCtrl;

// 			// Modes chain
// 			this.modes = ['day', 'month', 'year'];

// 			// Configuration attributes
// 			angular.forEach(
// 				[
// 					'formatDay',
// 					'formatMonth',
// 					'formatYear',
// 					'formatDayHeader',
// 					'formatDayTitle',
// 					'formatMonthTitle',
// 					'minMode',
// 					'maxMode',
// 					'showWeeks',
// 					'startingDay',
// 					'yearRange',
// 				],
// 				function(key, index) {
// 					self[key] = angular.isDefined($attrs[key])
// 						? index < 8
// 							? $interpolate($attrs[key])($scope.$parent)
// 							: $scope.$parent.$eval($attrs[key])
// 						: datepickerConfig[key];
// 				}
// 			);

// 			// Watchable date attributes
// 			angular.forEach(['minDate', 'maxDate'], function(key) {
// 				if ($attrs[key]) {
// 					$scope.$parent.$watch($parse($attrs[key]), function(value) {
// 						self[key] = value ? new Date(value) : null;
// 						self.refreshView();
// 					});
// 				} else {
// 					self[key] = datepickerConfig[key] ? new Date(datepickerConfig[key]) : null;
// 				}
// 			});

// 			$scope.datepickerMode = $scope.datepickerMode || datepickerConfig.datepickerMode;
// 			$scope.uniqueId = 'datepicker-' + $scope.$id + '-' + Math.floor(Math.random() * 10000);
// 			this.activeDate = angular.isDefined($attrs.initDate)
// 				? $scope.$parent.$eval($attrs.initDate)
// 				: new Date();

// 			$scope.isActive = function(dateObject) {
// 				if (self.compare(dateObject.date, self.activeDate) === 0) {
// 					$scope.activeDateId = dateObject.uid;
// 					return true;
// 				}
// 				return false;
// 			};

// 			this.init = function(ngModelCtrl_) {
// 				ngModelCtrl = ngModelCtrl_;

// 				ngModelCtrl.$render = function() {
// 					self.render();
// 				};
// 			};

// 			this.render = function() {
// 				if (ngModelCtrl.$modelValue) {
// 					var date = new Date(ngModelCtrl.$modelValue),
// 						isValid = !isNaN(date);

// 					if (isValid) {
// 						this.activeDate = date;
// 					} else {
// 						$log.error(
// 							'Datepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.'
// 						);
// 					}
// 					ngModelCtrl.$setValidity('date', isValid);
// 				}
// 				this.refreshView();
// 			};

// 			this.refreshView = function() {
// 				if (this.element) {
// 					this._refreshView();

// 					var date = ngModelCtrl.$modelValue ? new Date(ngModelCtrl.$modelValue) : null;
// 					ngModelCtrl.$setValidity(
// 						'date-disabled',
// 						!date || (this.element && !this.isDisabled(date))
// 					);
// 				}
// 			};

// 			this.createDateObject = function(date, format) {
// 				var model = ngModelCtrl.$modelValue ? new Date(ngModelCtrl.$modelValue) : null;
// 				return {
// 					date: date,
// 					label: dateFilter(date, format),
// 					selected: model && this.compare(date, model) === 0,
// 					disabled: this.isDisabled(date),
// 					current: this.compare(date, new Date()) === 0,
// 				};
// 			};

// 			this.isDisabled = function(date) {
// 				return (
// 					(this.minDate && this.compare(date, this.minDate) < 0) ||
// 					(this.maxDate && this.compare(date, this.maxDate) > 0) ||
// 					($attrs.dateDisabled && $scope.dateDisabled({ date: date, mode: $scope.datepickerMode }))
// 				);
// 			};

// 			// Split array into smaller arrays
// 			this.split = function(arr, size) {
// 				var arrays = [];
// 				while (arr.length > 0) {
// 					arrays.push(arr.splice(0, size));
// 				}
// 				return arrays;
// 			};

// 			$scope.select = function(date) {
// 				if ($scope.datepickerMode === self.minMode) {
// 					var dt = ngModelCtrl.$modelValue
// 						? new Date(ngModelCtrl.$modelValue)
// 						: new Date(0, 0, 0, 0, 0, 0, 0);
// 					dt.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
// 					ngModelCtrl.$setViewValue(dt);
// 					ngModelCtrl.$render();
// 				} else {
// 					self.activeDate = date;
// 					$scope.datepickerMode = self.modes[self.modes.indexOf($scope.datepickerMode) - 1];
// 				}
// 			};

// 			$scope.move = function(direction) {
// 				var year = self.activeDate.getFullYear() + direction * (self.step.years || 0),
// 					month = self.activeDate.getMonth() + direction * (self.step.months || 0);
// 				self.activeDate.setFullYear(year, month, 1);
// 				self.refreshView();
// 			};

// 			$scope.toggleMode = function(direction) {
// 				direction = direction || 1;

// 				if (
// 					($scope.datepickerMode === self.maxMode && direction === 1) ||
// 					($scope.datepickerMode === self.minMode && direction === -1)
// 				) {
// 					return;
// 				}

// 				$scope.datepickerMode = self.modes[self.modes.indexOf($scope.datepickerMode) + direction];
// 			};

// 			// Key event mapper
// 			$scope.keys = {
// 				13: 'enter',
// 				32: 'space',
// 				33: 'pageup',
// 				34: 'pagedown',
// 				35: 'end',
// 				36: 'home',
// 				37: 'left',
// 				38: 'up',
// 				39: 'right',
// 				40: 'down',
// 			};

// 			var focusElement = function() {
// 				$timeout(
// 					function() {
// 						self.element[0].focus();
// 					},
// 					0,
// 					false
// 				);
// 			};

// 			// Listen for focus requests from popup directive
// 			$scope.$on('datepicker.focus', focusElement);

// 			$scope.keydown = function(evt) {
// 				var key = $scope.keys[evt.which];

// 				if (!key || evt.shiftKey || evt.altKey) {
// 					return;
// 				}

// 				evt.preventDefault();
// 				evt.stopPropagation();

// 				if (key === 'enter' || key === 'space') {
// 					if (self.isDisabled(self.activeDate)) {
// 						return; // do nothing
// 					}
// 					$scope.select(self.activeDate);
// 					focusElement();
// 				} else if (evt.ctrlKey && (key === 'up' || key === 'down')) {
// 					$scope.toggleMode(key === 'up' ? 1 : -1);
// 					focusElement();
// 				} else {
// 					self.handleKeyDown(key, evt);
// 					self.refreshView();
// 				}
// 			};
// 		},
// 	])
// 	.directive('datepicker', function() {
// 		return {
// 			restrict: 'EA',
// 			replace: true,
// 			templateUrl: 'template/datepicker/datepicker.html',
// 			scope: {
// 				datepickerMode: '=?',
// 				dateDisabled: '&',
// 			},
// 			require: ['datepicker', '?^ngModel'],
// 			controller: 'DatepickerController',
// 			link: function(scope, element, attrs, ctrls) {
// 				var datepickerCtrl = ctrls[0],
// 					ngModelCtrl = ctrls[1]; // does this select the year picker?

// 				if (ngModelCtrl) {
// 					datepickerCtrl.init(ngModelCtrl);
// 				}
// 			},
// 		};
// 	})
// 	.directive('daypicker', [
// 		'dateFilter',
// 		function(dateFilter) {
// 			return {
// 				restrict: 'EA',
// 				replace: true,
// 				templateUrl: 'template/datepicker/day.html',
// 				require: '^datepicker',
// 				link: function(scope, element, attrs, ctrl) {
// 					scope.showWeeks = ctrl.showWeeks;

// 					ctrl.step = { months: 1 };
// 					ctrl.element = element;

// 					var DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
// 					function getDaysInMonth(year, month) {
// 						return month === 1 && year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
// 							? 29
// 							: DAYS_IN_MONTH[month];
// 					}

// 					function getDates(startDate, n) {
// 						var dates = new Array(n),
// 							current = new Date(startDate),
// 							i = 0;
// 						current.setHours(12); // Prevent repeated dates because of timezone bug
// 						while (i < n) {
// 							dates[i++] = new Date(current);
// 							current.setDate(current.getDate() + 1);
// 						}
// 						return dates;
// 					}

// 					ctrl._refreshView = function() {
// 						var year = ctrl.activeDate.getFullYear(),
// 							month = ctrl.activeDate.getMonth(),
// 							firstDayOfMonth = new Date(year, month, 1),
// 							difference = ctrl.startingDay - firstDayOfMonth.getDay(),
// 							numDisplayedFromPreviousMonth = difference > 0 ? 7 - difference : -difference,
// 							firstDate = new Date(firstDayOfMonth);

// 						if (numDisplayedFromPreviousMonth > 0) {
// 							firstDate.setDate(-numDisplayedFromPreviousMonth + 1);
// 						}

// 						// 42 is the number of days on a six-month calendar
// 						var days = getDates(firstDate, 42);
// 						for (var i = 0; i < 42; i++) {
// 							days[i] = angular.extend(ctrl.createDateObject(days[i], ctrl.formatDay), {
// 								secondary: days[i].getMonth() !== month,
// 								uid: scope.uniqueId + '-' + i,
// 							});
// 						}

// 						scope.labels = new Array(7);
// 						for (var j = 0; j < 7; j++) {
// 							scope.labels[j] = {
// 								abbr: dateFilter(days[j].date, ctrl.formatDayHeader),
// 								full: dateFilter(days[j].date, 'EEEE'),
// 							};
// 						}

// 						scope.title = dateFilter(ctrl.activeDate, ctrl.formatDayTitle);
// 						scope.rows = ctrl.split(days, 7);

// 						if (scope.showWeeks) {
// 							scope.weekNumbers = [];
// 							var weekNumber = getISO8601WeekNumber(scope.rows[0][0].date),
// 								numWeeks = scope.rows.length;
// 							while (scope.weekNumbers.push(weekNumber++) < numWeeks) {}
// 						}
// 					};

// 					ctrl.compare = function(date1, date2) {
// 						return (
// 							new Date(date1.getFullYear(), date1.getMonth(), date1.getDate()) -
// 							new Date(date2.getFullYear(), date2.getMonth(), date2.getDate())
// 						);
// 					};

// 					function getISO8601WeekNumber(date) {
// 						var checkDate = new Date(date);
// 						checkDate.setDate(checkDate.getDate() + 4 - (checkDate.getDay() || 7)); // Thursday
// 						var time = checkDate.getTime();
// 						checkDate.setMonth(0); // Compare with Jan 1
// 						checkDate.setDate(1);
// 						return Math.floor(Math.round((time - checkDate) / 86400000) / 7) + 1;
// 					}

// 					ctrl.handleKeyDown = function(key, evt) {
// 						var date = ctrl.activeDate.getDate();

// 						if (key === 'left') {
// 							date = date - 1; // up
// 						} else if (key === 'up') {
// 							date = date - 7; // down
// 						} else if (key === 'right') {
// 							date = date + 1; // down
// 						} else if (key === 'down') {
// 							date = date + 7;
// 						} else if (key === 'pageup' || key === 'pagedown') {
// 							var month = ctrl.activeDate.getMonth() + (key === 'pageup' ? -1 : 1);
// 							ctrl.activeDate.setMonth(month, 1);
// 							date = Math.min(
// 								getDaysInMonth(ctrl.activeDate.getFullYear(), ctrl.activeDate.getMonth()),
// 								date
// 							);
// 						} else if (key === 'home') {
// 							date = 1;
// 						} else if (key === 'end') {
// 							date = getDaysInMonth(ctrl.activeDate.getFullYear(), ctrl.activeDate.getMonth());
// 						}
// 						ctrl.activeDate.setDate(date);
// 					};

// 					ctrl.refreshView();
// 				},
// 			};
// 		},
// 	])
// 	.directive('monthpicker', [
// 		'dateFilter',
// 		function(dateFilter) {
// 			return {
// 				restrict: 'EA',
// 				replace: true,
// 				templateUrl: 'template/datepicker/month.html',
// 				require: '^datepicker',
// 				link: function(scope, element, attrs, ctrl) {
// 					ctrl.step = { years: 1 };
// 					ctrl.element = element;

// 					ctrl._refreshView = function() {
// 						var months = new Array(12),
// 							year = ctrl.activeDate.getFullYear();

// 						for (var i = 0; i < 12; i++) {
// 							months[i] = angular.extend(
// 								ctrl.createDateObject(new Date(year, i, 1), ctrl.formatMonth),
// 								{
// 									uid: scope.uniqueId + '-' + i,
// 								}
// 							);
// 						}

// 						scope.title = dateFilter(ctrl.activeDate, ctrl.formatMonthTitle);
// 						scope.rows = ctrl.split(months, 3);
// 					};

// 					ctrl.compare = function(date1, date2) {
// 						return (
// 							new Date(date1.getFullYear(), date1.getMonth()) -
// 							new Date(date2.getFullYear(), date2.getMonth())
// 						);
// 					};

// 					ctrl.handleKeyDown = function(key, evt) {
// 						var date = ctrl.activeDate.getMonth();

// 						if (key === 'left') {
// 							date = date - 1; // up
// 						} else if (key === 'up') {
// 							date = date - 3; // down
// 						} else if (key === 'right') {
// 							date = date + 1; // down
// 						} else if (key === 'down') {
// 							date = date + 3;
// 						} else if (key === 'pageup' || key === 'pagedown') {
// 							var year = ctrl.activeDate.getFullYear() + (key === 'pageup' ? -1 : 1);
// 							ctrl.activeDate.setFullYear(year);
// 						} else if (key === 'home') {
// 							date = 0;
// 						} else if (key === 'end') {
// 							date = 11;
// 						}
// 						ctrl.activeDate.setMonth(date);
// 					};

// 					ctrl.refreshView();
// 				},
// 			};
// 		},
// 	])
// 	.directive('yearpicker', [
// 		'dateFilter',
// 		function(dateFilter) {
// 			return {
// 				restrict: 'EA',
// 				replace: true,
// 				templateUrl: 'template/datepicker/year.html',
// 				require: '^datepicker',
// 				link: function(scope, element, attrs, ctrl) {
// 					var range = ctrl.yearRange;

// 					ctrl.step = { years: range };
// 					ctrl.element = element;

// 					function getStartingYear(year) {
// 						return parseInt((year - 1) / range, 10) * range + 1;
// 					}

// 					ctrl._refreshView = function() {
// 						var years = new Array(range);

// 						for (
// 							var i = 0, start = getStartingYear(ctrl.activeDate.getFullYear());
// 							i < range;
// 							i++
// 						) {
// 							years[i] = angular.extend(
// 								ctrl.createDateObject(new Date(start + i, 0, 1), ctrl.formatYear),
// 								{
// 									uid: scope.uniqueId + '-' + i,
// 								}
// 							);
// 						}

// 						scope.title = [years[0].label, years[range - 1].label].join(' - ');
// 						scope.rows = ctrl.split(years, 5);
// 					};

// 					ctrl.compare = function(date1, date2) {
// 						return date1.getFullYear() - date2.getFullYear();
// 					};

// 					ctrl.handleKeyDown = function(key, evt) {
// 						var date = ctrl.activeDate.getFullYear();

// 						if (key === 'left') {
// 							date = date - 1; // up
// 						} else if (key === 'up') {
// 							date = date - 5; // down
// 						} else if (key === 'right') {
// 							date = date + 1; // down
// 						} else if (key === 'down') {
// 							date = date + 5;
// 						} else if (key === 'pageup' || key === 'pagedown') {
// 							date += (key === 'pageup' ? -1 : 1) * ctrl.step.years;
// 						} else if (key === 'home') {
// 							date = getStartingYear(ctrl.activeDate.getFullYear());
// 						} else if (key === 'end') {
// 							date = getStartingYear(ctrl.activeDate.getFullYear()) + range - 1;
// 						}
// 						ctrl.activeDate.setFullYear(date);
// 					};

// 					ctrl.refreshView();
// 				},
// 			};
// 		},
// 	])
