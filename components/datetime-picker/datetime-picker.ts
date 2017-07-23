import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import * as View from '!view!./datetime-picker.html?style=./datetime-picker.styl';
import fns from 'date-fns';
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

	date: Date | null = null;
	time: Date = null as any;

	get minDateBounds() {
		return this.minDate ? new Date(this.minDate + this.timezoneOffset) : null;
	}

	get maxDateBounds() {
		return this.maxDate ? new Date(this.maxDate + this.timezoneOffset) : null;
	}

	created() {
		// Model will be a timestamp (in milliseconds).
		if (this.value) {
			// We need to offset the timestamp so that the datepicker and timepicker would work with dates local to the selected timezone.
			// e.g. if the selected timezone is +2 and the timestamp puts it at 2am UTC, the date/time pickers should be offsetted to show midnight.
			this.date = new Date(this.value + this.timezoneOffset);
			this.time = new Date(this.value + this.timezoneOffset);
		} else {
			// If no timestamp passed in, then set date to null.
			// This way they can select a date from scratch.
			// Time should be set to midnight, though.
			this.date = null;
			this.time = fns.startOfToday();
		}
	}

	@Watch('date')
	@Watch('time')
	@Watch('timezoneOffset')
	updateModel() {
		if (this.date && this.time) {
			// Get the selected date from the date/time pickers.
			// This date would be local to the timezone that was selected,
			// so it must first be offsetted back to UTC.
			const selectedDate = new Date(this.date);
			selectedDate.setHours(this.time.getHours());
			selectedDate.setMinutes(this.time.getMinutes());

			this.$emit('input', selectedDate.getTime() - this.timezoneOffset);
		}
	}
}
