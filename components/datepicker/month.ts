import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import * as View from '!view!./month.html';
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
export class AppDatepickerMonth extends Vue {
	@Prop(Date) value: Date;

	parent: AppDatepicker = null as any;

	title: string = null as any;
	rows: DatepickerDate[][] = [];

	created() {
		this.parent = findRequiredVueParent(this, AppDatepicker);
		this.onValueChanged();
	}

	@Watch('value')
	private onValueChanged() {
		const months = new Array<DatepickerDate>(12),
			year = this.value.getFullYear();

		for (let i = 0; i < 12; i++) {
			months[i] = this.parent.createDate(new Date(year, i, 1));
		}

		this.title = dateFilter(this.value, this.parent.formatMonthTitle);
		this.rows = arrayChunk(months, 3);
	}

	move(direction: number) {
		const newValue = new Date(this.value);
		newValue.setFullYear(newValue.getFullYear() + direction);
		this.$emit('input', newValue);
	}

	select(date: Date) {
		this.$emit('input', date);
		this.parent.toggleMode();
	}
}
