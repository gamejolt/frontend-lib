import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import './placeholder.styl';

@Component({
	name: 'lazy-placeholder',
})
export class AppLazyPlaceholder extends Vue
{
	@Prop() when: any;

	render( h: Vue.CreateElement )
	{
		return h(
			'div',
			{
				class: {
					'lazy-placeholder-resolving': !this.when,
					'lazy-placeholder-resolved': !!this.when,
				}
			},
			this.$slots.default,
		);
	}
}
