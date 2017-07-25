import Vue from 'vue';
import { Component, Watch, Prop } from 'vue-property-decorator';
import * as View from '!view!./day.html';
import { findRequiredVueParent } from '../../utils/vue';
import { AppDatepicker, DatepickerDate } from './datepicker';
import { date as dateFilter } from '../../vue/filters/date';
import { arrayChunk } from '../../utils/array';
import { AppJolticon } from '../../vue/components/jolticon/jolticon';

@View
@Component({
	components: {
		AppJolticon,
	},
})
export class AppDatepickerDay extends Vue {
	@Prop(Date) value: Date;

	parent: AppDatepicker = null as any;

	labels: { abbr: string; full: string }[] = [];
	title: string = null as any;
	rows: DatepickerDate[][] = [];
	weekNumbers: number[] = [];

	created() {
		this.parent = findRequiredVueParent(this, AppDatepicker);
		this.onValueChanged();
	}

	@Watch('value')
	private onValueChanged() {
		const year = this.value.getFullYear(),
			month = this.value.getMonth(),
			firstDayOfMonth = new Date(year, month, 1),
			firstDate = new Date(firstDayOfMonth);

		if (firstDayOfMonth.getDay() > 0) {
			firstDate.setDate(-firstDayOfMonth.getDay() + 1);
		}

		// 42 is the number of days on a six-month calendar
		const dates = this.getDates(firstDate, 42);
		const days = new Array<DatepickerDate>(42);
		for (let i = 0; i < 42; i++) {
			days[i] = this.parent.createDate(dates[i]);
		}

		this.labels = new Array(7);
		for (let i = 0; i < 7; i++) {
			this.labels[i] = {
				abbr: dateFilter(days[i].date, this.parent.formatDayHeader),
				full: dateFilter(days[i].date, this.parent.formatDayName),
			};
		}

		this.title = dateFilter(this.value, this.parent.formatDayTitle);
		this.rows = arrayChunk(days, 7);
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

	move(direction: number) {
		const newValue = new Date(this.value);
		newValue.setMonth(newValue.getMonth() + direction);
		this.$emit('input', newValue);
	}

	select(date: Date) {
		const newValue = new Date(this.value);
		newValue.setMonth(date.getMonth(), date.getDate());
		this.$emit('selected', newValue);
	}
}
