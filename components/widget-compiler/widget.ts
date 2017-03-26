import Vue from 'vue';
import { WidgetCompilerContext } from './widget-compiler.service';

export abstract class WidgetCompilerWidget
{
	abstract readonly name: string;
	abstract compile( context: WidgetCompilerContext, params: string[] ): Vue;

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

	namedParams( params: string[] = [] )
	{
		let namedParams: { [k: string]: string } = {};
		for ( const param of params ) {
			if ( param.indexOf( '=' ) === -1 ) {
				continue;
			}

			const pieces = param.split( '=' );
			if ( pieces.length !== 2 ) {
				continue;
			}

			namedParams[ pieces[0] ] = pieces[1];
		}

		return namedParams;
	}
}
