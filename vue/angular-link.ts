import Vue from 'vue';
import {
	Component,
	Inject,
	OnChanges,
	SimpleChanges,
	OnDestroy,
	AfterViewInit,
	EventEmitter,
} from 'ng-metadata/core';
import { kebabCase } from '../utils/string';

let componentCounter = 0;

export function makeComponentProvider(
	component: typeof Vue,
	outputs: string[] = [],
) {
	const instance = new component();
	const options = instance.$options;

	if (!options.name) {
		throw new Error(`Vue component needs a name to wrap it for angular.`);
	}

	const kebabName = kebabCase(options.name);

	@Component({
		selector: `gj-${kebabName}`,
		inputs: options.props ? Object.keys(options.props) : undefined,
		outputs: outputs.length ? outputs : undefined,
		template: `
		<span ng-transclude></span>
		<span></span>
		`,
		legacy: {
			transclude: true,
		},
	})
	class WrappedComponent implements AfterViewInit, OnChanges, OnDestroy {
		private ngEl: HTMLElement;
		private vueEl: HTMLElement;
		private vueComponent: Vue;

		private initialized = false;

		constructor(@Inject('$element') private $element: ng.IAugmentedJQuery) {
			this.ngEl = this.$element[0].children[0] as HTMLElement;
			this.vueEl = this.$element[0].children[1] as HTMLElement;
			this.vueEl.className =
				this.vueEl.className + ' ' + this.$element[0].className;

			for (const output of outputs) {
				(this as any)[output] = new EventEmitter<any>();
			}
		}

		ngAfterViewInit() {
			++componentCounter;
			const rootElement = createVueElement(this, options);
			rootElement.el = this.vueEl;

			this.vueComponent = new Vue(rootElement);
			this.initialized = true;

			// For some reason this is undefined some times...
			if (this.vueComponent.$el.querySelector) {
				const slot = this.vueComponent.$el.querySelector(
					`.ng-slot-${componentCounter}`,
				);
				if (slot) {
					slot.appendChild(this.ngEl);
				}
			}

			for (const output of outputs) {
				this.vueComponent.$el.addEventListener(output, (e: CustomEvent) => {
					(this as any)[output].emit(e.detail);
				});
			}
		}

		ngOnChanges(changes: SimpleChanges) {
			if (!this.initialized) {
				return;
			}

			for (const key in changes) {
				if (typeof changes[key].currentValue !== 'undefined') {
					(this.vueComponent as any)[key] = changes[key].currentValue;
				}
			}
		}

		ngOnDestroy() {
			if (this.vueComponent) {
				this.vueComponent.$destroy();
			}
		}
	}

	return WrappedComponent;
}

function createVueElement(ngComponent: any, componentDefinition: any) {
	componentDefinition = Object.assign({}, componentDefinition);
	const props: string[] = componentDefinition.props || {};

	let slotId = componentCounter;
	const rootElement: Vue.ComponentOptions<Vue> = {
		props,
		// Pass the initial data in.
		propsData: { ...ngComponent, slotId },
		computed: {
			reactiveProps(this: any) {
				const reactivePropsList: any = {
					slotId,
				};
				Object.keys(props).forEach(
					prop => (reactivePropsList[prop] = this[prop]),
				);
				return reactivePropsList;
			},
		},
		render(this: any, createElement: Vue.CreateElement) {
			const data = {
				props: this.reactiveProps,
			};

			return createElement(componentDefinition, data);
		},
	};

	return rootElement;
}
