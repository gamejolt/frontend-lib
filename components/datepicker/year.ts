import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./year.html';
import { findRequiredVueParent } from '../../utils/vue';
import { AppDatepicker, DateObj } from './datepicker';
import { arrayChunk } from '../../utils/array';
import { AppJolticon } from '../../vue/components/jolticon/jolticon';

@View
@Component({
	components: {
		AppJolticon,
	},
})
export class AppDatepickerYear extends Vue {
	parent: AppDatepicker = null as any;

	range = 0;
	title: string = null as any;
	rows: DateObj[][] = [];

	created() {
		this.parent = findRequiredVueParent(this, AppDatepicker);
		this.parent.activePicker = this;
		this.range = this.parent.yearRange;
	}

	mounted() {
		this.parent.refreshView();
	}

	move(direction: -1 | 1) {
		const year = this.parent.activeDate.getFullYear() + direction * this.range;
		const month = this.parent.activeDate.getMonth();
		this.parent.activeDate.setFullYear(year, month, 1);
		this.parent.refreshView();
	}

	private getStartingYear(year: number) {
		return (year - 1) / this.range * this.range + 1;
	}

	refreshView() {
		const years = new Array<DateObj>(this.range);

		const start = this.getStartingYear(this.parent.activeDate.getFullYear());
		for (let i = 0; i < this.range; i++) {
			const year = this.parent.createDateObject(new Date(start + i, 0, 1), this.parent.formatYear);
			years[i] = year;
		}

		this.title = [years[0].label, years[this.range - 1].label].join(' - ');
		this.rows = arrayChunk(years, 5);
	}

	compare(date1: Date, date2: Date) {
		return date1.getFullYear() - date2.getFullYear();
	}
}
