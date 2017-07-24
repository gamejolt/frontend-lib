import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./datepicker.html';
import './datepicker.styl';
import { AppDatepickerDay } from './day';
import { date as dateFilter } from '../../vue/filters/date';
import { AppDatepickerMonth } from './month';
import { AppDatepickerYear } from './year';

type DateMode = 'day' | 'month' | 'year';

export interface DateObj {
	date: Date;
	label: string;
	selected: boolean;
	disabled: boolean;
	current: boolean;
	secondary?: boolean;
}

@View
@Component({
	components: {
		AppDatepickerDay,
		AppDatepickerMonth,
		AppDatepickerYear,
	},
})
export class AppDatepicker extends Vue {
	@Prop(Date) value: Date | null;
	@Prop({ type: Date, default: null })
	minDate: Date;
	@Prop({ type: Date, default: null })
	maxDate: Date;
	@Prop(Date) initDate?: Date;
	@Prop(Function) dateDisabled?: (obj: { date: Date; mode: DateMode }) => any;

	formatDay = 'D';
	formatMonth = 'MMMM';
	formatYear = 'YYYY';
	formatDayHeader = 'ddd';
	formatDayTitle = 'MMMM YYYY';
	formatMonthTitle = 'YYYY';
	minMode: DateMode = 'day';
	maxMode: DateMode = 'year';
	showWeeks = false;
	startingDay = 0;
	yearRange = 20;

	modes: DateMode[] = ['day', 'month', 'year'];
	uniqueId = '';
	activeDate: Date = null as any;
	dateValid = false;
	dateDisabledValid = false;
	datepickerMode: DateMode = 'day';
	activePicker?: AppDatepickerDay | AppDatepickerMonth | AppDatepickerYear;

	created() {
		this.uniqueId = 'datepicker-' + Math.floor(Math.random() * 10000);
		this.activeDate = this.initDate || new Date();
	}

	isActive(dateObj: DateObj) {
		if (!this.activePicker) {
			return false;
		}

		if (this.activePicker.compare(dateObj.date, this.activeDate) === 0) {
			return true;
		}
		return false;
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
		console.log('refresh view');
		if (this.activePicker && this.activePicker.$el) {
			console.log('has active picker!');
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
}
