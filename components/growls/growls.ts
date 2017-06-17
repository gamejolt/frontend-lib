import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./growls.html?style=./growls.styl';

import { makeObservableService } from '../../utils/vue';
import { Growls } from './growls.service';
import { AppGrowl } from './growl';

@View
@Component({
	components: {
		AppGrowl,
	},
})
export class AppGrowls extends Vue {
	Growls = makeObservableService(Growls);
}
