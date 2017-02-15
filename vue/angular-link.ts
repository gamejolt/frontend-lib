import * as Vue from 'vue';
import { Component, Inject, OnChanges, SimpleChanges, OnDestroy, AfterViewInit } from 'ng-metadata/core';
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
		inputs: options.props ? Object.keys( options.props ) : undefined,
		template: '<div ng-transclude></div>',
		legacy: {
			transclude: true,
		}
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

			const rootElement = createVueElement( this.el, options );
			rootElement.el = this.el.children[ 0 ];

			this.vueElement = new Vue( rootElement );
			this.el.removeAttribute( 've-cloak' );
			this.el.setAttribute( 've-ready', '' );
		}

		ngOnChanges( changes: SimpleChanges )
		{
			for ( const key in changes ) {
				if ( typeof changes[ key ].currentValue !== 'undefined' ) {
					( this.vueElement as any )[ key ] = changes[ key ].currentValue;
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

function createVueElement( el: HTMLElement, componentDefinition: any )
{
	componentDefinition = Object.assign( {}, componentDefinition );
	const props: string[] = componentDefinition.props || {};

	// clone hack due to IE compatibility
	const elOriginalChildren = el.cloneNode( true ).childNodes;

	const rootElement: Vue.ComponentOptions<Vue> = {
		props,
		computed: {
			reactiveProps( this: any )
			{
				const reactivePropsList: any = {};
				Object.keys( props ).forEach(( prop ) => reactivePropsList[ prop ] = this[ prop ] );
				return reactivePropsList;
			}
		},
		render( this: any, createElement: Vue.CreateElement )
		{
			const data = {
				props: this.reactiveProps
			};

			const slots = getSlots( elOriginalChildren, createElement );

			return createElement(
				componentDefinition,
				data,
				slots,
			);
		}
	};

	return rootElement;
}

export function getAttributes( child: Node )
{
	const attributes: { [k: string]: string | null | undefined } = {};

	for ( let i = 0; i < child.attributes.length; ++i ) {
		const attribute = child.attributes[ i ];
		attributes[ attribute.nodeName === 'vue-slot' ? 'slot' : attribute.nodeName ] = attribute.nodeValue;
	}

	return attributes;
}

export function getSlots( children: NodeList, createElement: Vue.CreateElement )
{
	const slots = [];

	for ( let i = 0; i < children.length; ++i ) {
		const child = children[ i ] as HTMLElement;

		if ( child.nodeName === '#text' ) {
			if ( child.nodeValue!.trim() ) {
				slots.push( createElement( 'span', child.nodeValue as string ) );
			}
		}
		else {
			const attributes = getAttributes( child );
			const elementOptions: any = {
				attrs: attributes,
				domProps: {
					innerHTML: child.innerHTML,
				}
			};

			if ( attributes['slot'] ) {
				elementOptions.slot = attributes['slot'];
				attributes['slot'] = undefined;
			}

			slots.push( createElement( child.tagName, elementOptions ) );
		}
	}

	return slots;
}
