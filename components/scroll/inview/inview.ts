import Vue, { CreateElement } from 'vue';
import { Component, Watch, Prop } from 'vue-property-decorator';

import { Ruler } from '../../ruler/ruler-service';
import { ScrollInviewContainer } from './container';
import { findVueParent } from '../../../utils/vue';
import { AppScrollInviewParent } from './parent';
import { arrayRemove } from '../../../utils/array';

// This is the root container we use if there's no inview parent.
let BaseContainer: ScrollInviewContainer;
if (!GJ_IS_SSR) {
	BaseContainer = new ScrollInviewContainer(document);
}

@Component({})
export class AppScrollInview extends Vue {
	@Prop({ type: String, default: 'div' })
	tag: string;
	@Prop({ type: Number, default: 0 })
	extraPadding: number;

	inView = false;

	// Don't have Vue watch these by not setting their default values.
	top: number;
	bottom: number;

	get container() {
		const parent = findVueParent(this, AppScrollInviewParent);
		return parent ? parent.container : BaseContainer;
	}

	async mounted() {
		// Wait for the parent container to bootstrap in.
		await this.$nextTick();
		this.container.items.push(this);

		// Queue a check so that we can group together all the other components that may mount in
		// and do one single check.
		this.container.queueCheck();
	}

	destroyed() {
		arrayRemove(this.container.items, i => i === this);
	}

	render(h: CreateElement) {
		return h(this.tag, this.$slots.default);
	}

	@Watch('inView')
	inViewChanged() {
		if (this.inView) {
			this.$emit('inview');
		} else {
			this.$emit('outview');
		}
	}

	recalcBox() {
		const offset = Ruler.offset(this.$el);
		this.top = offset.top - this.extraPadding;

		// Offset gets returned relative to the window. We need to make this relative to our parent.
		if (!(this.container.context instanceof HTMLDocument)) {
			const parentOffset = Ruler.offset(this.container.context);
			this.top -= parentOffset.top;
		}

		this.bottom = offset.top + offset.height + this.extraPadding;
	}
}
