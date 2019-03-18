import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { findRequiredVueParent } from '../../../../utils/vue';
import AppExpand from '../../../expand/expand.vue';
import { Screen } from '../../../screen/screen-service';
import AppCardList from '../list';

@Component({
	components: {
		AppExpand,
	},
})
export default class AppCardListAdd extends Vue {
	@Prop(String) label!: string;

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
