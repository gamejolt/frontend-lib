import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./parent.html';

import { ScrollInviewContainer } from './container';
const ResizeSensor = require('css-element-queries/src/ResizeSensor');

@View
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

		// There are two cases when we need to force a recheck of items contained in this parent.
		// One is when this parent container height changes--we need to recalculate what's still
		// contained in it. The second is when the inner content height changes--this usually
		// happens when content inside this parent changes and things may have shifted around.
		new ResizeSensor(this.$el, () => this.container.queueCheck());
		new ResizeSensor(this.$refs.resizeContainer, () => this.container.queueCheck());
	}
}
