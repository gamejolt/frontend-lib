import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./jolticon.html';

@View
@Component({})
export class AppJolticon extends Vue {
	@Prop(String) icon!: string;
	@Prop(Boolean) big?: boolean;
	@Prop(Boolean) highlight?: boolean;
	@Prop(Boolean) notice?: boolean;
}
