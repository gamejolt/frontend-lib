import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./item.html?style=./item.styl';

import { AppCardList } from '../list';
import { findVueParent, makeObservableService } from '../../../../utils/vue';
import { AppExpand } from '../../../expand/expand';
import { AppCard } from '../../card';
import { AppJolticon } from '../../../../vue/components/jolticon/jolticon';
import { Screen } from '../../../screen/screen-service';

@View
@Component({
	components: {
		AppExpand,
		AppCard,
		AppJolticon,
	},
})
export class AppCardListItem extends Vue {
	@Prop() item: any;
	@Prop({ type: Boolean, default: false })
	isInactive: boolean;

	list: AppCardList = null as any;

	Screen = makeObservableService(Screen);

	get isActive() {
		return this.list.activeItem === this.item;
	}

	get isExpandable() {
		return !!this.$slots.body;
	}

	get isDraggable() {
		return this.list.isDraggable;
	}

	created() {
		this.list = findVueParent(this, AppCardList) as AppCardList;
		if (!this.list) {
			throw new Error(`Couldn't find parent card.`);
		}
	}

	onClick() {
		if (this.isExpandable) {
			this.list.activate(this.isActive ? null : this.item);
		}
	}
}
