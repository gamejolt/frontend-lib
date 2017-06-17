import * as angular from 'angular';
import { bundle } from 'ng-metadata/core';
import { reflector } from 'ng-metadata/src/core/reflection/reflection';
import {
	OutputMetadata,
	InputMetadata,
} from 'ng-metadata/src/core/directives/metadata_directives';
import { ResolvePolicy } from 'angular-ui-router';
import { getProvider } from './utils';
import { isPrerender } from '../components/environment/environment.service';
import { kebabCase } from './string';

export function bootstrapFacade(
	$q: ng.IQService,
	$animate: ng.animate.IAnimateService,
) {
	(window as any).Promise = $q;

	// Disable angular animations if we're prerendering.
	if (isPrerender) {
		$animate.enabled(false);
	}
}

export function lazyBundle(moduleClass: any) {
	return getProvider<any>('$ocLazyLoad').load({
		name: bundle(moduleClass).name,
	});
}

export interface StateCreatorOptions {
	abstract?: boolean;
	url?: string;
	resolve?: any;
	lazyLoad?: () => Promise<any>;
	lazyLoadComponent?: string;
	resolvePolicy?: { [k: string]: ResolvePolicy };
	params?: any;
}

export function makeState(name: string, options: StateCreatorOptions) {
	stateProvider.$inject = ['$stateProvider'];
	function stateProvider($stateProvider: any) {
		let routeComponent: any;

		const state: any = {
			abstract: options.abstract,
			url: options.url,
			resolve: options.resolve,
			resolvePolicy: options.resolvePolicy,
			params: options.params,
		};

		if (options.lazyLoad) {
			const loader = options.lazyLoad;
			state.lazyLoad = async () => {
				const mod = await loader();
				routeComponent = options.lazyLoadComponent
					? mod[options.lazyLoadComponent]
					: mod.default;
			};

			state.templateProvider = () => {
				// If the module doesn't return a default component, then
				// we should instead generate a default template.
				if (!routeComponent) {
					return '<ui-view></ui-view>';
				}

				return genRouteTemplate(routeComponent);
			};
		} else if (options.abstract) {
			state.template = '<ui-view></ui-view>';
		}

		$stateProvider.state(name, state);
	}

	angular.module('App.Views').config(stateProvider);
}

// https://github.com/ngParty/ng-metadata/issues/118
function genRouteTemplate(component: any) {
	const [annotation] = reflector.annotations(component);
	const propsMetadata = reflector.propMetadata(component);
	const props = Object.keys(propsMetadata);

	const mappedProps = props.map(prop => {
		const propMetadata = propsMetadata[prop][0];
		if (propMetadata instanceof InputMetadata) {
			return ` [${kebabCase(
				prop,
			)}]="::$resolve['${prop}'] || $ctrl['${prop}']"`;
		} else if (propMetadata instanceof OutputMetadata) {
			return ` (${kebabCase(prop)})="$ctrl['${prop}']( $event )"`;
		}
	});

	return `<${annotation.selector} ${mappedProps}></${annotation.selector}>`;
}
