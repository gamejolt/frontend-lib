import Vue, { CreateElement } from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

import { ScrollInviewContainer } from './container';

@Component({})
export class AppScrollInviewParent extends Vue {
	@Prop(Number) throttle?: number;
	@Prop(Number) velocity?: number;

	// Don't have Vue watch these by not setting their default values.
	container: ScrollInviewContainer;

	$refs: {
		resizeContainer: HTMLElement;
	};

	mounted() {
		this.container = new ScrollInviewContainer(this.$el, this.throttle, this.velocity);
	}

	render(h: CreateElement) {
		return h('div', this.$slots.default);
	}
}
