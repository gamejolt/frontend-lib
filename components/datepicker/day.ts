import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./day.html';
import { findRequiredVueParent } from '../../utils/vue';
import { AppDatepicker, DateObj } from './datepicker';
import { date as dateFilter } from '../../vue/filters/date';
import { arrayChunk } from '../../utils/array';
import { AppJolticon } from '../../vue/components/jolticon/jolticon';

@View
@Component({
	components: {
		AppJolticon,
	},
})
export class AppDaypicker extends Vue {
	parent: AppDatepicker = null as any;

	labels: { abbr: string; full: string }[] = [];
	title: string = null as any;
	rows: DateObj[][] = [];
	weekNumbers: number[] = [];

	readonly DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

	created() {
		this.parent = findRequiredVueParent(this, AppDatepicker);
		this.parent.activePicker = this;
	}

	mounted() {
		this.parent.refreshView();
	}

	private getDaysInMonth(year: number, month: number) {
		return month === 1 && year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
			? 29
			: this.DAYS_IN_MONTH[month];
	}

	private getDates(startDate: Date, n: number) {
		const dates = new Array<Date>(n),
			current = new Date(startDate);

		current.setHours(12); // Prevent repeated dates because of timezone bug
		for (let i = 0; i < n; i++) {
			dates[i] = new Date(current);
			current.setDate(current.getDate() + 1);
		}
		return dates;
	}

	move(direction: -1 | 1) {
		const year = this.parent.activeDate.getFullYear();
		const month = this.parent.activeDate.getMonth() + direction;
		this.parent.activeDate.setFullYear(year, month, 1);
		this.parent.refreshView();
	}

	refreshView() {
		const year = this.parent.activeDate.getFullYear(),
			month = this.parent.activeDate.getMonth(),
			firstDayOfMonth = new Date(year, month, 1),
			difference = this.parent.startingDay - firstDayOfMonth.getDay(),
			numDisplayedFromPreviousMonth = difference > 0 ? 7 - difference : -difference,
			firstDate = new Date(firstDayOfMonth);

		if (numDisplayedFromPreviousMonth > 0) {
			firstDate.setDate(-numDisplayedFromPreviousMonth + 1);
		}

		// 42 is the number of days on a six-month calendar
		const dates = this.getDates(firstDate, 42);
		const days = new Array<DateObj>(42);
		for (let i = 0; i < 42; i++) {
			const dateObj = this.parent.createDateObject(dates[i], this.parent.formatDay);
			dateObj.uid = `${this.parent.uniqueId}-${i}`;
			dateObj.secondary = dates[i].getMonth() !== month;
			days[i] = dateObj;
		}

		this.labels = new Array(7);
		for (let i = 0; i < 7; i++) {
			this.labels[i] = {
				abbr: dateFilter(days[i].date, this.parent.formatDayHeader),
				full: dateFilter(days[i].date, 'dddd'),
			};
		}

		this.title = dateFilter(this.parent.activeDate, this.parent.formatDayTitle);
		this.rows = arrayChunk(days, 7);

		if (this.parent.showWeeks) {
			this.weekNumbers = [];
			const numWeeks = this.rows.length;
			let weekNumber = this.getISO8601WeekNumber(this.rows[0][0].date);
			while (this.weekNumbers.push(weekNumber++) < numWeeks) {}
		}
	}

	compare(date1: Date, date2: Date) {
		return (
			new Date(date1.getFullYear(), date1.getMonth(), date1.getDate()).getTime() -
			new Date(date2.getFullYear(), date2.getMonth(), date2.getDate()).getTime()
		);
	}

	getISO8601WeekNumber(date: Date) {
		const checkDate = new Date(date);
		checkDate.setDate(checkDate.getDate() + 4 - (checkDate.getDay() || 7)); // Thursday
		const time = checkDate.getTime();
		checkDate.setMonth(0); // Compare with Jan 1
		checkDate.setDate(1);
		return Math.floor(Math.round((time - checkDate.getTime()) / 86400000) / 7) + 1;
	}

	handleKeyDown(key: string, _evt: KeyboardEvent) {
		console.log('handling key down');
		let date = this.parent.activeDate.getDate();

		if (key === 'left') {
			date = date - 1; // up
		} else if (key === 'up') {
			date = date - 7; // down
		} else if (key === 'right') {
			date = date + 1; // down
		} else if (key === 'down') {
			date = date + 7;
		} else if (key === 'pageup' || key === 'pagedown') {
			const month = this.parent.activeDate.getMonth() + (key === 'pageup' ? -1 : 1);
			this.parent.activeDate.setMonth(month, 1);
			date = Math.min(
				this.getDaysInMonth(
					this.parent.activeDate.getFullYear(),
					this.parent.activeDate.getMonth()
				),
				date
			);
		} else if (key === 'home') {
			date = 1;
		} else if (key === 'end') {
			date = this.getDaysInMonth(
				this.parent.activeDate.getFullYear(),
				this.parent.activeDate.getMonth()
			);
		}
		this.parent.activeDate.setDate(date);
		this.parent.refreshView();
	}
}
