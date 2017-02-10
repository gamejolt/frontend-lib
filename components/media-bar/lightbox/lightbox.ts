import * as Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
const VueShortkey = require( 'vue-shortkey' );
import * as View from '!view!./lightbox.html?style=./lightbox.styl';

import { Screen } from '../../screen/screen-service';
import { AppMediaBar } from '../media-bar';
import { Loader } from '../../loader/loader.service';
import { Analytics } from '../../analytics/analytics.service';
import { AppMediaBarLightboxSlider } from './slider';
import { AppJolticon } from '../../../vue/components/jolticon/jolticon';
import { AppMediaBarLightboxItem } from './item/item';

Vue.use( VueShortkey );

export const MediaBarLightboxConfig = {
	opacityStart: 0.5,
	scaleStart: 0.5,
	controlsHeight: 80,
	itemPadding: 40,
};

@View
@Component({
	name: 'media-bar-lightbox',
	components: {
		AppJolticon,
		AppMediaBarLightboxSlider,
		AppMediaBarLightboxItem,
	}
})
export class AppMediaBarLightbox extends Vue
{
	@Prop( Object ) mediaBar: AppMediaBar;

	sliderElem: HTMLElement;

	currentSliderOffset = 0;
	maxItemWidth = 0;
	maxItemHeight = 0;

	activeElem: HTMLElement | null = null;
	nextElem: HTMLElement | null = null;
	prevElem: HTMLElement | null = null;
	isDragging = false;
	waitingForFrame = false;

	Loader = Loader;

	resize$ = Screen.resizeChanges.subscribe( () =>
	{
		this.calcMaxDimensions();
		this.refreshSliderPosition();
	} );

	created()
	{
		Loader.load( 'hammer-vue' );
	}

	destroy()
	{
		this.resize$.unsubscribe();
	}

	setSlider( slider: HTMLElement )
	{
		this.sliderElem = slider;
		this.calcMaxDimensions();
		this.refreshSliderPosition();
		this.syncUrl();
	}

	calcMaxDimensions()
	{
		this.maxItemWidth = (Screen.windowWidth * 0.8);
		this.maxItemHeight = Screen.windowHeight - (MediaBarLightboxConfig.controlsHeight * 2);
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
			if ( this.mediaBar.activeItem.media_type === 'image' ) {
				hash = 'screenshot-';
			}
			else if ( this.mediaBar.activeItem.media_type === 'video' ) {
				hash = 'video-';
			}
			else if ( this.mediaBar.activeItem.media_type === 'sketchfab' ) {
				hash = 'sketchfab-';
			}
			hash += this.mediaBar.activeItem.id;
		}
		else {
			// TODO: Remove this once angular fixes its business.
			hash = 'close';
		}

		// Replace the URL. This way people can link to it by pulling from the browser bar,
		// but we don't want it to mess up their history navigation after closing.
		// this.$location.hash( hash ).replace();
	}

	refreshSliderPosition()
	{
		const padding = Screen.windowWidth * 0.1;

		let newOffset: number;
		if ( this.mediaBar.activeIndex === 0 ) {
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

		this.activeElem = this.$el.getElementsByClassName( 'active' )[0] as HTMLElement;
		this.nextElem = this.$el.getElementsByClassName( 'next' )[0] as HTMLElement;
		this.prevElem = this.$el.getElementsByClassName( 'prev' )[0] as HTMLElement;

		this.$el.classList.add( 'dragging' );
	}

	pan( event: HammerInput )
	{
		if ( !this.waitingForFrame ) {
			this.waitingForFrame = true;
			window.requestAnimationFrame( () => this.panTick( event ) );
		}
	}

	panTick( event: HammerInput )
	{
		this.waitingForFrame = false;

		// In case the animation frame was retrieved after we stopped dragging.
		if ( !this.isDragging ) {
			return;
		}

		this.sliderElem.style.transform = `translate3d( ${this.currentSliderOffset + event.deltaX}px, 0, 0 )`;

		const slidePercent = Math.abs( event.deltaX ) / (Screen.windowWidth * 0.8);
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

	panEnd( event: HammerInput )
	{
		this.isDragging = false;

		this.$el.classList.remove( 'dragging' );

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
		const velocity = event.velocityX;
		if ( Math.abs( velocity ) > 0.65 && event.distance > 10 ) {
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
	};
}
