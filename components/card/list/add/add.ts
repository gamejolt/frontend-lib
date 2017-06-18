import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./add.html?style=./add.styl';

import { AppExpand } from '../../../expand/expand';
import { AppCardList } from '../list';
import { findVueParent, makeObservableService } from '../../../../utils/vue';
import { Screen } from '../../../screen/screen-service';

@View
@Component({
	components: {
		AppExpand,
	},
})
export class AppCardListAdd extends Vue {
	@Prop(String) label: string;

	list: AppCardList = null as any;

	Screen = makeObservableService(Screen);

	get isActive() {
		return this.list.isAdding;
	}

	created() {
		this.list = findVueParent(this, AppCardList) as AppCardList;
		if (!this.list) {
			throw new Error(`Couldn't find parent card.`);
		}
	}

	toggle() {
		this.$emit('toggle');
	}
}
