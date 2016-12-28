import { Component, Inject, OnInit, Input, SkipSelf } from 'ng-metadata/core';
import { Screen } from '../../screen/screen-service';
import template from 'html!./item.component.html';
import { MediaBarComponent } from '../media-bar.component';

@Component({
	selector: 'gj-media-bar-item',
	template,
})
export class MediaBarItemComponent implements OnInit
{
	@Input( '<' ) item: any;

	elem: HTMLElement;

	constructor(
		@Inject( '$element' ) private $element: ng.IAugmentedJQuery,
		// @Inject( 'Analytics' ) private analytics: any,
		@Inject( 'Screen' ) private screen: Screen,
		@Inject( MediaBarComponent ) @SkipSelf() private mediaBar: MediaBarComponent,
	)
	{
		this.$element[0].classList.add( 'media-bar-item' );
	}

	ngOnInit()
	{
		this.elem = this.$element[0];

		// We set the dimensions on the thumbnails manually.
		// This way we can size it correct before it loads.
		if ( this.item.media_type == 'image' ) {
			const dimensions = this.item.media_item.getDimensions( 400, 150 );
			this.elem.style.width = dimensions.width + 'px';
			this.elem.style.height = dimensions.height + 'px';
		}
		else {
			// Video thumbnails are hardcoded to this width.
			this.elem.style.width = '200px';
		}
	}

	onLoadedChange( isLoaded: boolean )
	{
		if ( isLoaded ) {
			this.elem.classList.add( 'loaded' );
		}
		else {
			this.elem.classList.remove( 'loaded' );
		}
	}

	onClick()
	{
		// Lightbox is turned off on mobile.
		if ( !this.screen.isXs ) {
			this.mediaBar.setActiveItem( this.item );
		}
		else {
			// Analytics.trackEvent( 'media-bar', 'item-click-mobile' );
		}
	};
}
