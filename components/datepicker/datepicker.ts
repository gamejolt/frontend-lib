import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./datepicker.html';
import './datepicker.styl';
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
