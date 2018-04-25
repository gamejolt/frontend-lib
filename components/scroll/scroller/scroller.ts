import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./scroller.html?style=./scroller.styl';

import 'simplebar/dist/simplebar.css';

@View
@Component({})
export class AppScrollScroller extends Vue {
	@Prop(Boolean) overlay?: boolean;
	@Prop(Boolean) horizontal?: boolean;

	mounted() {
		if (this.overlay) {
			import('simplebar').then(SimpleBar => {
				new SimpleBar(this.$el, { wrapContent: false, scrollbarMinSize: 30 });
			});
		}
	}
}
