import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./item.html?style=./item.styl';

import { AppCardList } from '../list';
import { findRequiredVueParent } from '../../../../utils/vue';
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
	@Prop(Boolean) forceActive?: boolean;

	list: AppCardList = null as any;

	readonly Screen = Screen;

	get isActive() {
		return this.forceActive || this.list.activeItem === this.item;
	}

	get isExpandable() {
		return !!this.$slots.body;
	}

	get isDraggable() {
		return this.list.isDraggable;
	}

	created() {
		this.list = findRequiredVueParent(this, AppCardList);
	}

	onClick() {
		if (this.isExpandable) {
			this.list.activate(this.isActive ? null : this.item);
		}
	}
}
