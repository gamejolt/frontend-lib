import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./add.html?style=./add.styl';

import { AppExpand } from '../../../expand/expand';
import { AppCardList } from '../list';
import { Screen } from '../../../screen/screen-service';
import { findRequiredVueParent } from '../../../../utils/vue';

@View
@Component({
	components: {
		AppExpand,
	},
})
export class AppCardListAdd extends Vue {
	@Prop(String) label: string;

	list: AppCardList = null as any;

	readonly Screen = Screen;

	get isActive() {
		return this.list.isAdding;
	}

	created() {
		this.list = findRequiredVueParent(this, AppCardList);
	}

	toggle() {
		this.$emit('toggle');
	}
}
