import Vue, { CreateElement } from 'vue';
import * as distance from 'date-fns/distance_in_words_to_now';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { date } from '../../../vue/filters/date';

@Component({})
export class AppTimeAgo extends Vue {
	@Prop([Number, Date])
	date: number | Date;
	@Prop(Boolean) withoutSuffix?: boolean;

	private timeout?: number;
	private timeAgo = '';
	private fixedTime = '';

	created() {
		this.fixedTime = date(this.date, 'medium');
		this.refresh();
	}

	destroyed() {
		this.clearTimeout();
	}

	@Watch('date')
	onDateChanged() {
		this.clearTimeout();
		this.refresh();
	}

	private clearTimeout() {
		if (this.timeout) {
			clearTimeout(this.timeout);
			this.timeout = undefined;
		}
	}

	private refresh() {
		const time = distance(this.date);

		if (this.withoutSuffix) {
			this.timeAgo = time;
		} else {
			this.timeAgo = this.$gettextInterpolate('%{ time } ago', { time });
		}

		// In minutes.
		const input = this.date instanceof Date ? this.date.getTime() : this.date;
		const diff = (Date.now() - input) / 1000 / 60;

		let secondsUntilUpdate = 3600;
		if (diff < 1) {
			secondsUntilUpdate = 1;
		} else if (diff < 60) {
			secondsUntilUpdate = 30;
		} else if (diff < 180) {
			secondsUntilUpdate = 300;
		}

		if (!GJ_IS_SSR) {
			this.timeout = window.setTimeout(() => this.refresh(), secondsUntilUpdate * 1000);
		}
	}

	render(h: CreateElement) {
		return h('span', {
			domProps: {
				innerText: this.timeAgo,
				title: this.fixedTime,
			},
		});
	}
}
