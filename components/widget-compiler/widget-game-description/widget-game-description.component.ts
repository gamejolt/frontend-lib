import { Component, Input } from 'ng-metadata/core';

@Component({
	selector: 'gj-widget-compiler-widget-game-media',
	template: `
		<div ng-if="$ctrl.mediaItems.length">
			<gj-media-bar media-items="$ctrl.mediaItems"></gj-media-bar>
		</div>
	`,
})
export class WidgetCompilerWidgetGameMediaComponent
{
	@Input( '<' ) mediaItems: any[];
}
