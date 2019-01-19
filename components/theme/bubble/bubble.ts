import View from '!view!./bubble.html?style=./bubble.styl';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import './bubble-global.styl';

@View
@Component({})
export class AppThemeBubble extends Vue {
	@Prop(String)
	highlight!: string;

	@Prop(String)
	backlight?: string;

	@Prop(Boolean)
	active?: boolean;

	@Prop(Boolean)
	disabled?: boolean;
}
