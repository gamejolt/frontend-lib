import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./month.html';
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
export class AppDatepickerMonth extends Vue {
	parent: AppDatepicker = null as any;

	title: string = null as any;
	rows: DateObj[][] = [];

	created() {
		this.parent = findRequiredVueParent(this, AppDatepicker);
		this.parent.activePicker = this;
	}

	mounted() {
		this.parent.refreshView();
	}

	refreshView() {
		const months = new Array<DateObj>(12),
			year = this.parent.activeDate.getFullYear();

		for (let i = 0; i < 12; i++) {
			const month = this.parent.createDateObject(new Date(year, i, 1), this.parent.formatMonth);
			months[i] = month;
		}

		this.title = dateFilter(this.parent.activeDate, this.parent.formatMonthTitle);
		this.rows = arrayChunk(months, 3);
	}

	move(direction: -1 | 1) {
		const year = this.parent.activeDate.getFullYear() + direction;
		const month = this.parent.activeDate.getMonth();
		this.parent.activeDate.setFullYear(year, month, 1);
		this.parent.refreshView();
	}

	compare(date1: Date, date2: Date) {
		return (
			new Date(date1.getFullYear(), date1.getMonth()).getTime() -
			new Date(date2.getFullYear(), date2.getMonth()).getTime()
		);
	}
}
