import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view?-scoped!./tab-list.html?style=./tab-list.styl';

import { Screen } from '../../screen/screen-service';
import { makeObservableService } from '../../../utils/vue';

@View
@Component({})
export class AppNavTabList extends Vue {
	@Prop(Boolean) center?: boolean;

	Screen = makeObservableService(Screen);
}
