import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import * as View from '!view!./timepicker.html?style=./timepicker.styl';
import { AppJolticon } from '../../vue/components/jolticon/jolticon';

@View
@Component({
	components: {
		AppJolticon,
	},
})
export class AppTimepicker extends Vue {
	@Prop(Date) value: Date;
	@Prop({ type: Number, default: 1 })
	hourStep: number;
	@Prop({ type: Number, default: 1 })
	minuteStep: number;
	@Prop({ type: Boolean, default: true })
	showMeridian: boolean;
	@Prop(Array) meridians?: [string, string];
	@Prop(Boolean) readonlyInput: boolean;

	selected: Date = null as any;
	hours = '';
	minutes = '';
	meridian = '';
	invalidHours = false;
	invalidMinutes = false;

	// The component assumed it is a form, but since it isn't anymore, validity is a simple boolean.
	// Embedding forms can watch on this value to use in their own validity filters or whatever.
	valid = true;

	$refs: {
		hours: HTMLInputElement;
		minutes: HTMLInputElement;
	};

	private get _meridians() {
		return this.meridians || [this.$gettext('AM'), this.$gettext('PM')];
	}

	// Get this.hours in 24H mode if valid
	get validHours() {
		let hours = parseInt(this.hours, 10);
		const valid = this.showMeridian ? hours >= 0 && hours < 13 : hours >= 0 && hours < 24;
		if (!valid) {
			return undefined;
		}

		if (this.showMeridian) {
			if (hours === 12) {
				hours = 0;
			}
			if (this.meridian === this._meridians[1]) {
				hours = hours + 12;
			}
		}
		return hours;
	}

	get validMinutes() {
		const minutes = parseInt(this.minutes, 10);
		return minutes >= 0 && minutes < 60 ? minutes : undefined;
	}

	created() {
		if (!this.value) {
			this.selected = new Date();
			this.selected.setSeconds(0, 0);
			this.$emit('input', this.selected);
		} else {
			this.selected = new Date(this.value);
		}
	}

	mounted() {
		this.makeValid();
		this.updateDisplayFields();
	}

	private invalidate(hours: boolean | null, minutes: boolean | null) {
		// TODO: should set selected to null?
		this.$emit('input', null);

		this.valid = false;
		if (hours !== null) {
			this.invalidHours = hours;
		}
		if (minutes !== null) {
			this.invalidMinutes = minutes;
		}
	}

	updateHours() {
		if (this.readonlyInput) {
			return;
		}

		const hours = this.validHours;
		if (hours !== undefined) {
			this.selected.setHours(hours);
			this.refresh();
		} else {
			this.invalidate(true, null);
		}
	}

	updateMinutes() {
		if (this.readonlyInput) {
			return;
		}

		const minutes = this.validMinutes;
		if (minutes !== undefined) {
			this.selected.setMinutes(minutes);
			this.refresh();
		} else {
			this.invalidate(null, true);
		}
	}

	pad(value: any) {
		if (!value) {
			return '00';
		}

		return value.toString().length < 2 ? '0' + value : value + '';
	}

	// Call internally when we know that model is valid.
	refresh(updateDisplayFields?: boolean) {
		this.makeValid();
		this.$emit('input', this.selected);

		if (updateDisplayFields !== false) {
			this.updateDisplayFields();
		}
	}

	makeValid() {
		this.valid = true;
		this.invalidHours = false;
		this.invalidMinutes = false;
	}

	updateDisplayFields() {
		let hours = this.selected.getHours(),
			minutes = this.selected.getMinutes();

		if (this.showMeridian) {
			hours = hours === 0 || hours === 12 ? 12 : hours % 12; // Convert 24 to 12 hour system
		}

		this.hours = this.pad(hours);
		this.minutes = this.pad(minutes);
		this.meridian = this.selected.getHours() < 12 ? this._meridians[0] : this._meridians[1];
	}

	addMinutes(minutes: number) {
		if (this.readonlyInput) {
			return;
		}

		const dt = new Date(this.selected.getTime() + minutes * 60000);
		this.selected.setHours(dt.getHours(), dt.getMinutes());

		this.refresh();
	}

	incrementHours() {
		this.addMinutes(this.hourStep * 60);
	}

	decrementHours() {
		this.addMinutes(-this.hourStep * 60);
	}

	incrementMinutes() {
		this.addMinutes(this.minuteStep);
	}

	decrementMinutes() {
		this.addMinutes(-this.minuteStep);
	}

	toggleMeridian() {
		this.addMinutes(12 * 60 * (this.selected.getHours() < 12 ? 1 : -1));
	}

	@Watch('hours')
	@Watch('minutes')
	onTimeChanged() {
		const hours = this.validHours,
			minutes = this.validMinutes;

		// If the hours and minutes are valid, update the v-model.
		// Don't update the display fields however because the user might still be editing the input field.
		if (hours !== undefined && minutes !== undefined) {
			this.selected.setHours(hours, minutes);
			this.refresh(false);
		}
	}

	@Watch('showMeridian')
	onShowMeridianChanged() {
		if (!this.valid) {
			// Evaluate from template
			const hours = this.validHours,
				minutes = this.validMinutes;
			if (hours !== undefined && minutes !== undefined) {
				this.selected.setHours(hours, minutes);
				this.refresh();
			}
		} else {
			this.updateDisplayFields();
		}
	}
}
