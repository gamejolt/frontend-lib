import { Component, Inject, SkipSelf, AfterViewInit, OnDestroy } from 'ng-metadata/core';
import * as template from '!html-loader!./lightbox.component.html';

import { Screen } from '../../screen/screen-service';
import { MediaBarComponent } from '../media-bar.component';
import { Loader } from '../../loader/loader.service';
import { Analytics } from '../../analytics/analytics.service';

export const MediaBarLightboxConfig = {
	opacityStart: 0.5,
	scaleStart: 0.5,
	controlsHeight: 80,
	itemPadding: 40,
};

@Component({
	selector: 'gj-media-bar-lightbox',
	template,
})
export class MediaBarLightboxComponent implements AfterViewInit, OnDestroy
{
	elem: HTMLElement;
	sliderElem: HTMLElement;

	currentSliderOffset = 0;
	maxItemWidth: number;
	maxItemHeight: number;

	activeElem?: HTMLElement;
	nextElem?: HTMLElement;
	prevElem?: HTMLElement;
	isDragging = false;
	waitingForFrame = false;

	Loader = Loader;

	constructor(
		@Inject( '$timeout' ) private $timeout: ng.ITimeoutService,
		@Inject( '$animate' ) private $animate: ng.animate.IAnimateService,
		@Inject( '$element' ) private $element: ng.IAugmentedJQuery,
		@Inject( '$scope' ) private $scope: ng.IScope,
		@Inject( '$location' ) private $location: ng.ILocationService,
		@Inject( 'Screen' ) private screen: Screen,
		@Inject( 'hotkeys' ) private hotkeys: ng.hotkeys.HotkeysProvider,
		@Inject( MediaBarComponent ) @SkipSelf() private mediaBar: MediaBarComponent,
	)
	{
		this.elem = $element[0];

		this.screen.setResizeSpy( $scope, () =>
		{
			this.calcMaxDimensions();
			this.refreshSliderPosition();

			// We have to do it after the changes are applied to the dom, since the
			// max width/height get passed to items through the DOM.
			this.$timeout( () => $scope.$broadcast( 'MediaBarLightbox.onResize' ), 1 );
		} );

		this.hotkeys.bindTo( $scope ).add( {
			combo: 'right',
			description: 'Next item.',
			callback: ( $event: Event ) =>
			{
				this.goNext();
				$event.preventDefault();
			}
		} )
		.add( {
			combo: 'left',
			description: 'Previous item.',
			callback: ( $event: Event ) =>
			{
				this.goPrev();
				$event.preventDefault();
			}
		} )
		.add( {
			combo: 'esc',
			description: 'Close media lightbox.',
			callback: ( $event: Event ) =>
			{
				this.close();
				$event.preventDefault();
			}
		} );
	}

	ngAfterViewInit()
	{
		Loader.load( 'hammer' );
	}

	setSlider( slider: HTMLElement )
	{
		this.sliderElem = slider;

		// Move it to the body.
		// This should fix the z-indexing and put it on top of the whole shell.
		window.document.body.appendChild( this.elem );

		this.calcMaxDimensions();
		this.refreshSliderPosition();
		this.syncUrl();
	}

	calcMaxDimensions()
	{
		this.maxItemWidth = (this.screen.windowWidth * 0.8);
		this.maxItemHeight = this.screen.windowHeight - (MediaBarLightboxConfig.controlsHeight * 2);
	}

	goNext()
	{
		this.mediaBar.goNext();
		this.refreshSliderPosition();
		this.syncUrl();
	}

	goPrev()
	{
		this.mediaBar.goPrev();
		this.refreshSliderPosition();
		this.syncUrl();
	}

	close()
	{
		this.mediaBar.clearActiveItem();
		this.syncUrl();
	}

	syncUrl()
	{
		let hash = '';

		if ( this.mediaBar.activeItem ) {
			if ( this.mediaBar.activeItem.media_type == 'image' ) {
				hash = 'screenshot-';
			}
			else if ( this.mediaBar.activeItem.media_type == 'video' ) {
				hash = 'video-';
			}
			else if ( this.mediaBar.activeItem.media_type == 'sketchfab' ) {
				hash = 'sketchfab-';
			}
			hash += this.mediaBar.activeItem.id;
		}
		else {
			// TODO: Remove this once angular fixes its business.
			hash = 'close';
		}

		// Replace the URL. This way people can link to it by pulling from the browser bar,
		// but we don't want it to mess up their history navigating after closing.
		this.$location.hash( hash ).replace();
	}

	refreshSliderPosition()
	{
		const padding = this.screen.windowWidth * 0.1;

		let newOffset: number;
		if ( this.mediaBar.activeIndex == 0 ) {
			newOffset = padding;
		}
		else {
			newOffset = -(this.maxItemWidth * this.mediaBar.activeIndex - padding);
		}

		this.sliderElem.style.transform = `translate3d( ${newOffset}px, 0, 0 )`;
		this.currentSliderOffset = newOffset;
	}

	panStart()
	{
		this.isDragging = true;

		this.activeElem = this.elem.getElementsByClassName( 'active' )[0] as HTMLElement;
		this.nextElem = this.elem.getElementsByClassName( 'next' )[0] as HTMLElement;
		this.prevElem = this.elem.getElementsByClassName( 'prev' )[0] as HTMLElement;

		this.elem.classList.add( 'dragging' );
	}

	pan( $event: HammerInput )
	{
		if ( !this.waitingForFrame ) {
			this.waitingForFrame = true;
			window.requestAnimationFrame( () => this.panTick( $event ) );
		}
	}

	panTick( $event: HammerInput )
	{
		this.waitingForFrame = false;

		// In case the animation frame was retrieved after we stopped dragging.
		if ( !this.isDragging ) {
			return;
		}

		this.sliderElem.style.transform = `translate3d( ${this.currentSliderOffset + $event.deltaX}px, 0, 0 )`;

		const slidePercent = Math.abs( $event.deltaX ) / (this.screen.windowWidth * 0.8);
		const opacity = MediaBarLightboxConfig.opacityStart + (slidePercent * (1 - MediaBarLightboxConfig.opacityStart));
		const scale = MediaBarLightboxConfig.scaleStart + (slidePercent * (1 - MediaBarLightboxConfig.scaleStart));

		if ( this.nextElem ) {
			this.nextElem.style.opacity = opacity + '';
			this.nextElem.style.transform = `scale( ${scale}, ${scale} )`;
		}

		if ( this.prevElem ) {
			this.prevElem.style.opacity = opacity + '';
			this.prevElem.style.transform = `scale( ${scale}, ${scale} )`;
		}

		// Do the inverse of what we do with the adjacent siblings.
		if ( this.activeElem ) {
			const scaleX = (1 + MediaBarLightboxConfig.scaleStart) - scale;
			const scaleY = (1 + MediaBarLightboxConfig.scaleStart) - scale;
			this.activeElem.style.opacity = ((1 + MediaBarLightboxConfig.opacityStart) - opacity) + '';
			this.activeElem.style.transform = `scale( ${scaleX}, ${scaleY} )`;
		}
	}

	panEnd( $event: HammerInput )
	{
		this.isDragging = false;

		this.$scope.$apply( () =>
		{
			this.elem.classList.remove( 'dragging' );

			this.activeElem!.style.opacity = '';
			if ( this.prevElem ) {
				this.prevElem.style.opacity = '';
			}

			if ( this.nextElem ) {
				this.nextElem.style.opacity = '';
			}

			this.activeElem!.style.transform = '';
			if ( this.prevElem ) {
				this.prevElem.style.transform = '';
			}

			if ( this.nextElem ) {
				this.nextElem.style.transform = '';
			}

			// Make sure we moved at a high enough velocity and distance to register the "swipe".
			const velocity = $event.velocityX;
			if ( Math.abs( velocity ) > 0.65 && $event.distance > 10 ) {
				if ( velocity < 0 ) {
					this.goNext();
					Analytics.trackEvent( 'media-bar', 'swiped-next' );
				}
				else {
					this.goPrev();
					Analytics.trackEvent( 'media-bar', 'swiped-prev' );
				}
				return;
			}

			// We don't change the active item and instead just refresh the slider position.
			// This should reset the position after us moving it in drag().
			this.refreshSliderPosition();
		} );
	};

	// Since we're on the body now, we have to remember to manually remove the element
	// when the scope is destroyed.
	ngOnDestroy()
	{
		// Don't do the leave if the animation system will do it automatically.
		// This is when the ng-if triggers.
		// But when we change views, the element seems to stay.
		this.$timeout( () =>
		{
			if ( !this.elem.classList.contains( 'ng-leave' ) ) {
				this.$animate.leave( this.$element );
			}
		}, 0, false );
	}
}
