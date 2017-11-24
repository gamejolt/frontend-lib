import Vue, { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';

@Component({})
export class AppPopoverContext extends Vue {
	render(h: CreateElement) {
		return h('div', { domProps: { id: 'popover-context' } }, this.$slots.default);
	}
}
