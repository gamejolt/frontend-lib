import * as Vue from 'vue';
import { WidgetCompilerContext } from './widget-compiler.service';

export abstract class WidgetCompilerWidget
{
	abstract readonly name: string;
	abstract compile( context: WidgetCompilerContext, params: any[] ): Vue;

	wrapComponent( component: typeof Vue, propGetter: () => any )
	{
		// Not sure if there is a way to do this without instantiating a new
		// component.
		const options = new component().$options;

		return new Vue( {
			computed: {
				reactiveProps( this: any )
				{
					return propGetter();
				},
			},
			render( this: any, h: Vue.CreateElement )
			{
				return h( options, {
					props: this.reactiveProps,
				} );
			},
		} );
	}
}
