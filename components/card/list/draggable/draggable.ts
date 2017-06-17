import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import * as View from '!view!./draggable.html';

import { AppCardList } from '../list';
import { findVueParent } from '../../../../utils/vue';

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
		this.list = findVueParent(this, AppCardList) as AppCardList;
		if (!this.list) {
			throw new Error(`Couldn't find card list parent.`);
		}

		this.list.isDraggable = !this.disabled;
	}

	@Watch('disabled')
	onDisabledChanged() {
		this.list.isDraggable = !this.disabled;
	}
}
