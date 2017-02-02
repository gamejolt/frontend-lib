import { Component, Input, OnInit, Inject } from 'ng-metadata/core';

@Component({
	selector: 'gj-widget-compiler-widget-soundcloud',
	template: `
		<iframe nwdisable nwfaketop
			width="100%"
			height="166"
			scrolling="no"
			frameborder="no"
			ng-src="{{ $ctrl.embedSrc }}"
			>
		</iframe>
	`,
})
export class WidgetCompilerWidgetSoundcloudComponent implements OnInit
{
	@Input( '<trackId' ) trackId = '';
	@Input( '<color' ) color = '';

	embedSrc: string;

	constructor(
		@Inject( '$sce' ) private $sce: ng.ISCEService,
	)
	{
	}

	ngOnInit()
	{
		this.embedSrc = 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/' + this.trackId;

		if ( this.color ) {
			this.embedSrc += '&amp;color=' + this.color;
		}

		this.embedSrc = this.$sce.trustAsResourceUrl( this.embedSrc );
	}
}
