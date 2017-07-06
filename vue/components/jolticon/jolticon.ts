import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./jolticon.html';

@View
@Component({})
export class AppJolticon extends Vue {
	@Prop([String])
	icon: string;
	@Prop([Boolean])
	big?: boolean;
}
