import { Component, Input, Inject, SkipSelf, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { MediaBarComponent } from '../../media-bar.component';
import { MediaBarLightboxComponent, MediaBarLightboxConfig } from '../lightbox.component';
import template from 'html!./item.component.html';

@Component({
	selector: 'gj-media-bar-lightbox-item',
	template,
})
export class MediaBarLightboxItemComponent implements OnInit, OnChanges
{
	@Input( '<' ) item: any;
	@Input( '<' ) itemIndex: number;
	@Input( '<' ) activeIndex: number;
	@Input( '<' ) mediaBar: MediaBarComponent;

	elem: HTMLElement;

	isActive = false;
	isNext = false;
	isPrev = false;

	maxWidth?: number;
	maxHeight?: number;

	constructor(
		// @Inject( '$window' ) private $window: ng.IWindowService,
		@Inject( '$timeout' ) private $timeout: ng.ITimeoutService,
		@Inject( '$scope' ) $scope: ng.IScope,
		@Inject( '$element' ) $element: ng.IAugmentedJQuery,
		@Inject( MediaBarLightboxComponent ) @SkipSelf() private lightbox: MediaBarLightboxComponent,
	)
	{
		this.elem = $element[0];
		$scope.$on( 'MediaBarLightbox.onResize', () => this.calcDimensions() );
	}

	ngOnInit()
	{
		this.calcActive();
		this.calcDimensions();
	}

	ngOnChanges( changes: SimpleChanges )
	{
		if ( changes['activeIndex'] ) {
			this.calcActive();
		}
	}

	play()
	{
		this.mediaBar.isPlaying = this.itemIndex;
	}

	calcDimensions()
	{
		this.maxWidth = this.lightbox.maxItemWidth - MediaBarLightboxConfig.itemPadding;
		this.maxHeight = this.lightbox.maxItemHeight;

		const captionElement = this.elem.getElementsByClassName( 'media-bar-lightbox-item-caption' )[0] as HTMLElement;
		if ( captionElement ) {
			this.maxHeight -= captionElement.offsetHeight;
		}

		if ( this.item.media_type == 'image' ) {
			const dimensions = this.item.media_item.getDimensions( this.maxWidth, this.maxHeight );
			this.maxWidth = dimensions.width;
			this.maxHeight = dimensions.height;
		}
	}

	calcActive()
	{
		this.isActive = this.activeIndex == this.itemIndex;
		this.isNext = this.activeIndex + 1 == this.itemIndex;
		this.isPrev = this.activeIndex - 1 == this.itemIndex;

		this.elem.classList.remove( 'active', 'next', 'prev' );

		if ( this.isActive ) {
			this.elem.classList.add( 'active' );
		}
		else if ( this.isPrev ) {
			this.elem.classList.add( 'prev' );
		}
		else if ( this.isNext ) {
			this.elem.classList.add( 'next' );
		}

		if ( this.isActive || this.isNext || this.isPrev ) {

			// Since changing these values affect whether or not the image is loaded (ng-if in the template)
			// we have to wait until angular compiles back in.
			this.$timeout( () => this.calcDimensions(), 0 );
		}
	}
}

