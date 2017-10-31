import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import View from '!view!./draggable.html';

import { AppCardList } from '../list';
import { findRequiredVueParent } from '../../../../utils/vue';

const draggable = require('vuedraggable');

@View
@Component({
	components: {
		draggable,
	},
})
export class AppCardListDraggable extends Vue {
	@Prop(Boolean) disabled?: boolean;

	list: AppCardList = null as any;

	get items() {
		return this.list.items;
	}

	set items(items: any[]) {
		this.$emit('change', items);
	}

	created() {
		this.list = findRequiredVueParent(this, AppCardList);
		this.list.isDraggable = !this.disabled;
	}

	@Watch('disabled')
	onDisabledChanged() {
		this.list.isDraggable = !this.disabled;
	}
}
