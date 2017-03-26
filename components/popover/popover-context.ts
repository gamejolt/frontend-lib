import Vue from 'vue';
import { Component } from 'vue-property-decorator';

@Component({
	name: 'popover-context',
})
export class AppPopoverContext extends Vue
{
	render( h: Vue.CreateElement )
	{
		return h( 'div', { domProps: { id: 'popover-context' } }, this.$slots.default );
	}
}
