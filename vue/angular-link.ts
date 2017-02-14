import * as Vue from 'vue';
import { Component, Inject, OnChanges, SimpleChanges, OnDestroy } from 'ng-metadata/core';
import { kebabCase } from '../utils/string';

export function makeComponentProvider( component: typeof Vue )
{
	const instance = new component();
	const options = instance.$options;

	if ( !options.name ) {
		throw new Error( `Vue component needs a name to wrap it for angular.` );
	}

	const kebabName = kebabCase( options.name );

	@Component( {
		selector: `gj-${kebabName}`,
		inputs: Object.keys( options.props ),
		template: '<div></div>',
	})
	class WrappedComponent implements OnChanges, OnDestroy
	{
		private el: HTMLElement;
		private vueElement: Vue;

		constructor(
			@Inject( '$element' ) private $element: ng.IAugmentedJQuery
		)
		{
			this.el = this.$element[ 0 ];

			const rootElement = createVueElement( options );
			rootElement.el = this.el.children[ 0 ];

			this.vueElement = new Vue( rootElement );
			this.el.removeAttribute( 've-cloak' );
			this.el.setAttribute( 've-ready', '' );
		}

		ngOnChanges( changes: SimpleChanges )
		{
			for ( const key in changes ) {
				if ( typeof changes[ key ].currentValue !== 'undefined' ) {
					(this.vueElement as any)[ key ] = changes[ key ].currentValue;
				}
			}
		}

		ngOnDestroy()
		{
			if ( this.vueElement ) {
				this.vueElement.$destroy();
			}
		}
	}

	return WrappedComponent;
}

function createVueElement( componentDefinition: any )
{
	componentDefinition = Object.assign( {}, componentDefinition );
	const props: string[] = componentDefinition.props;

	const rootElement: any = {
		props,
		computed: {
			reactiveProps( this: any )
			{
				const reactivePropsList: any = {};
				Object.keys( props ).forEach( ( prop ) => reactivePropsList[ prop ] = this[ prop ] );
				return reactivePropsList;
			}
		},
		render( this: any, createElement: any )
		{
			const data = {
				props: this.reactiveProps
			};

			return createElement( componentDefinition, data );
		}
	};

	return rootElement;
}
