import Vue from 'vue';
import startOfToday from 'date-fns/start_of_today';
import { Component, Prop, Watch } from 'vue-property-decorator';
import * as View from '!view!./datetime-picker.html?style=./datetime-picker.styl';

import { AppDatepicker } from '../datepicker/datepicker';
import { AppTimepicker } from '../timepicker/timepicker';

@View
@Component({
	components: {
		AppDatepicker,
		AppTimepicker,
	},
})
export class AppDatetimePicker extends Vue {
	@Prop(Number) value: number;
	@Prop(Number) timezoneOffset: number;
	@Prop(Number) minDate?: number;
	@Prop(Number) maxDate?: number;

	get datetime() {
		return new Date(this.value + this.timezoneOffset);
	}

	get minDateBounds() {
		return this.minDate ? new Date(this.minDate + this.timezoneOffset) : null;
	}

	get maxDateBounds() {
		return this.maxDate ? new Date(this.maxDate + this.timezoneOffset) : null;
	}

	created() {
		if (!this.value) {
			throw new Error('Value must be initialized');
		}
	}

	@Watch('timezoneOffset')
	onTimezoneChanged(oldOffset: number, newOffset: number) {
		this.$emit('input', this.value + oldOffset - newOffset);
	}

	select(date: Date) {
		console.log('eyy');
		// Get the selected date from the date/time pickers.
		// This date would be local to the timezone that was selected,
		// so it must first be offsetted back to UTC.
		this.$emit('input', date.getTime() - this.timezoneOffset);
	}
}
