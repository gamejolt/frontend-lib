import { NgModule } from 'ng-metadata/core';
import { makeComponentProvider } from '../../vue/angular-link';
import { AppWidgetCompiler } from './widget-compiler';

@NgModule({
	declarations: [
		makeComponentProvider( AppWidgetCompiler ),
	],
})
export class WidgetCompilerModule { }
