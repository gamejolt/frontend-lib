import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./bar.html?style=./bar.styl';

@View
@Component({})
export class AppProgressBar extends Vue {
	@Prop(Number) percent: number;
	@Prop(Boolean) thin?: boolean;
	@Prop(String) variant?: string;
	@Prop(Boolean) active?: boolean;
	@Prop(Boolean) indeterminate?: boolean;
}
