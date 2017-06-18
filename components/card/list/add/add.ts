import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./add.html?style=./add.styl';
import { AppExpand } from '../../../expand/expand';

@View
@Component({
	components: {
		AppExpand,
	},
})
export class AppCardListAdd extends Vue {
	@Prop(String) label: string;

	isActive = false;
}
