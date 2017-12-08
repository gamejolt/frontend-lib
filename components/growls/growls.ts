import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import View from '!view!./growls.html?style=./growls.styl';

import { Growls } from './growls.service';
import { AppGrowl } from './growl';

@View
@Component({
	components: {
		AppGrowl,
	},
})
export class AppGrowls extends Vue {
	readonly Growls = Growls;
}
