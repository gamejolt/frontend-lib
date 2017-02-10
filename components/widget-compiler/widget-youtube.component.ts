import { Component, Input } from 'ng-metadata/core';

@Component({
	selector: 'gj-widget-compiler-widget-youtube',
	template: `
		<gj-video-embed
			video-provider="youtube"
			[video-id]="$ctrl.videoId"
			>
		</gj-video-embed>
	`,
})
export class WidgetCompilerWidgetYoutubeComponent
{
	@Input( '<videoId' ) videoId = '';
}
