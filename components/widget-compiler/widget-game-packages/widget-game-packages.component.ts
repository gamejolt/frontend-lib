import { Component, Input } from 'ng-metadata/core';

@Component({
	selector: 'gj-widget-compiler-widget-game-packages',
	template: `

	`,
})
export class WidgetCompilerWidgetGamePackagesComponent
{
	@Input( '<' ) game: any;
	@Input( '<' ) packages: any[];
}
