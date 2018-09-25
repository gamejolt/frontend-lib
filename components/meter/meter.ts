import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./meter.html?style=./meter.styl';

@View
@Component({})
export class AppMeter extends Vue {
	@Prop(Number) rating!: number;
	@Prop(Boolean) big?: boolean;

	get level() {
		return (this.rating || 0) * 2;
	}
}
