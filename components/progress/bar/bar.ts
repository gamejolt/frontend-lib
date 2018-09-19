import View from '!view!./bar.html?style=./bar.styl';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@View
@Component({})
export class AppProgressBar extends Vue {
	@Prop(Number)
	percent!: number;

	@Prop(Boolean)
	thin?: boolean;

	@Prop(String)
	variant?: string;

	@Prop(Boolean)
	active?: boolean;

	@Prop(Boolean)
	indeterminate?: boolean;

	@Prop({ type: Boolean, default: true })
	animate!: boolean;
}
