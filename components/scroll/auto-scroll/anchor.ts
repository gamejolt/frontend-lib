import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Scroll } from '../scroll.service';

@Component({})
export class AppAutoscrollAnchor extends Vue
{
	@Prop( { required: true } ) scrollKey: any;

	mounted()
	{
		Scroll.autoscrollAnchor = this;
	}

	destroyed()
	{
		Scroll.autoscrollAnchor = undefined;
	}

	render( h: Vue.CreateElement )
	{
		return h( 'div', this.$slots.default );
	}
}
