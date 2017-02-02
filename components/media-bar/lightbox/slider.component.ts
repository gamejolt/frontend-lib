import { Component, Inject, SkipSelf, AfterViewInit, HostBinding } from 'ng-metadata/core';
import { MediaBarLightboxComponent } from './lightbox.component';

@Component({
	selector: 'gj-media-bar-lightbox-slider',
	template: `<div ng-transclude></div>`,
	legacy: {
		transclude: true,
	}
})
export class MediaBarLightboxSliderComponent implements AfterViewInit
{
	@HostBinding( 'class.media-bar-lightbox-slider' ) _class = true;

	constructor(
		@Inject( '$element' ) private $element: ng.IAugmentedJQuery,
		@Inject( MediaBarLightboxComponent ) @SkipSelf() private lightbox: MediaBarLightboxComponent,
	)
	{
	}

	ngAfterViewInit()
	{
		this.lightbox.setSlider( this.$element[0] );
	}
}
