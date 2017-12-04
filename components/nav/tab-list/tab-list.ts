import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view?-scoped!./tab-list.html?style=./tab-list.styl';

import { Screen } from '../../screen/screen-service';

@View
@Component({})
export class AppNavTabList extends Vue {
	@Prop(Boolean) center?: boolean;

	readonly Screen = Screen;
}
