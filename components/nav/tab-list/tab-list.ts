import * as Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view?-scoped!./tab-list.html?style=./tab-list.styl';

@View
@Component({
	name: 'nav-tab-list',
})
export class AppNavTabList extends Vue
{
	@Prop( Boolean ) center?: boolean;

	@Prop( Number ) slotId: number;
}
