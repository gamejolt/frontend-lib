import 'core-js/es6/map';
import * as Vue from 'vue';

import { Screen } from '../../screen/screen-service';
import { Ruler } from '../../ruler/ruler-service';
import { ImgHelper } from '../helper/helper-service';

const WIDTH_HEIGHT_REGEX = /\/(\d+)x(\d+)\//;
const WIDTH_REGEX = /\/(\d+)\//;

const registeredDirectives = new Map< HTMLElement, any>();

export const AppImgResponsive: Vue.DirectiveOptions = {
	async inserted( el: HTMLImageElement, binding )
	{
		el.classList.add( 'img-responsive' );

		registeredDirectives.set( el, {
			resizeChanges: Screen.resizeChanges.subscribe(
				() => updateSrc( el, binding.value )
			),
		} );

		// Make sure the view is compiled.
		await Vue.nextTick();
		updateSrc( el, binding.value );
	},
	update( el: HTMLImageElement, binding )
	{
		if ( binding.value !== binding.oldValue ) {
			updateSrc( el, binding.value );
		}
	},
	unbind( el )
	{
		const elData = registeredDirectives.get( el );
		if ( elData ) {
			elData.resizeChanges.unsubscribe();
			registeredDirectives.delete( el );
		}
	}
};

async function updateSrc( el: HTMLImageElement, src: string )
{
	const containerWidth = Ruler.width( el.parentNode as HTMLElement );

	// Make sure we never do a 0 width, just in case.
	// Seems to happen in some situations.
	if ( containerWidth <= 0 ) {
		return;
	}

	// Update width in the URL.
	// We keep width within 100px increment bounds.
	let newSrc = src;
	let mediaserverWidth = containerWidth;
	if ( Screen.isHiDpi ) {

		// For high dpi, double the width.
		mediaserverWidth = mediaserverWidth * 2;
		mediaserverWidth = Math.ceil( mediaserverWidth / 100 ) * 100;
	}
	else {
		mediaserverWidth = Math.ceil( mediaserverWidth / 100 ) * 100;
	}

	if ( newSrc.search( WIDTH_HEIGHT_REGEX ) !== -1 ) {
		newSrc = newSrc.replace( WIDTH_HEIGHT_REGEX, '/' + mediaserverWidth + 'x2000/' );
	}
	else {
		newSrc = newSrc.replace( WIDTH_REGEX, '/' + mediaserverWidth + '/' );
	}

	// Only if the src changed from previous runs.
	// They may be the same if the user resized the window but image container didn't change dimensions.
	if ( newSrc !== el.src ) {
		el.src = newSrc;

		// Keep the isLoaded state up to date?
		el.dispatchEvent( new CustomEvent( 'imgloadchange', { detail: false } ) );
		await ImgHelper.loaded( newSrc );
		el.dispatchEvent( new CustomEvent( 'imgloadchange', { detail: true } ) );
	}
}
