import { NgModule, ModuleWithProviders } from '@angular/core';
import { WidgetCompilerBindDirective } from './widget-compiler-bind.directive';

const COMPONENTS: any[] = [
	WidgetCompilerBindDirective,
];

const PROVIDERS: any[] = [
];

@NgModule( {
	imports: [],
	exports: [
		...COMPONENTS
	],
	declarations: [
		...COMPONENTS
	],
})
export class WidgetCompilerModule
{
	static forRoot(): ModuleWithProviders
	{
		return {
			ngModule: WidgetCompilerModule,
			providers: [
				...PROVIDERS
			]
		};
	}
}
