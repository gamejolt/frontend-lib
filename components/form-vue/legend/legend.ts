import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./legend.html?style=./legend.styl';

@View
@Component({})
export class AppFormLegend extends Vue {
	@Prop(Boolean) compact?: boolean;
	@Prop(Boolean) expandable?: boolean;
	@Prop(Boolean) expanded?: boolean;
}
