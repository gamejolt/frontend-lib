import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

import { Screen } from '../screen/screen-service';
import { Ruler } from '../ruler/ruler-service';

@Component({
	name: 'responsive-dimensions',
})
export class AppResponsiveDimensions extends Vue
{
	@Prop( Number ) ratio: number;

	private resized$ = Screen.resizeChanges.subscribe( () => this.updateDimensions() );
	private height = 'auto';

	mounted()
	{
		this.updateDimensions();
	}

	destroyed()
	{
		this.resized$.unsubscribe();
	}

	render( h: Vue.CreateElement )
	{
		return h(
			'div',
			{ style: { height: this.height } },
			this.$slots.default,
		);
	}

	@Watch( 'ratio' )
	private updateDimensions()
	{
		const containerWidth = Ruler.width( this.$el.parentNode as HTMLElement );
		this.height = `${containerWidth / this.ratio}px`;
	}
}
