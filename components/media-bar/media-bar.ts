import * as Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import * as View from '!view!./media-bar.html?style=./media-bar.styl';

import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { Analytics } from '../analytics/analytics.service';
import { AppLoading } from '../../vue/components/loading/loading';
import { AppMediaBarItem } from './item/item';
import { AppMediaBarLightbox } from './lightbox/lightbox';

@View
@Component({
	name: 'media-bar',
	components: {
		AppLoading,
		AppMediaBarItem,
		AppMediaBarLightbox,
	}
})
export class AppMediaBar extends Vue
{
	@Prop() mediaItems: any[];

	private urlChecked = false;
	private lightbox?: AppMediaBarLightbox;

	activeItem: any | null = null;
	activeIndex: number | null = null;
	isPlaying: number | null = null;

	Screen = Screen;

	@Watch( 'activeItem' )
	activeItemChange()
	{
		if ( this.activeItem && !this.lightbox ) {
			this.createLightbox();
		}
		else if ( !this.activeItem && this.lightbox ) {
			this.destroyLightbox();
		}
	}

	updated()
	{
		if ( typeof this.mediaItems !== 'undefined' && !this.urlChecked ) {
			this.checkUrl();
		}
	}

	destroyed()
	{
		this.destroyLightbox();
	}

	setActiveItem( item: any )
	{
		let index = item;
		if ( typeof item === 'object' ) {
			index = this.mediaItems.findIndex( ( _item ) => _item.id === item.id );
		}

		this.go( index );
		this.trackEvent( 'item-click', index );
	}

	goNext()
	{
		this.go( Math.min( (this.mediaItems.length - 1), this.activeIndex + 1 ) );
		this.trackEvent( 'next' );
	}

	goPrev()
	{
		this.go( Math.max( 0, this.activeIndex - 1 ) );
		this.trackEvent( 'prev' );
	}

	go( index: number )
	{
		this.activeIndex = index;
		this.activeItem = this.mediaItems[ this.activeIndex ];
		this.isPlaying = this.activeIndex;
	}

	clearActiveItem()
	{
		this.activeItem = null;
		this.activeIndex = null;
		this.isPlaying = null;
		this.trackEvent( 'close' );
	}

	private checkUrl()
	{
		this.urlChecked = true;

		// If there is a hash in the URL, let's try to load it in.
		let id: number | undefined;
		const hash = window.location.hash;
		if ( hash ) {
			let type: string | undefined;
			if ( hash.indexOf( 'screenshot-' ) !== -1 ) {
				id = parseInt( hash.substring( 'screenshot-'.length ), 10 );
				type = 'image';
			}
			else if ( hash.indexOf( 'video-' ) !== -1 ) {
				id = parseInt( hash.substring( 'video-'.length ), 10 );
				type = 'video';
			}
			else if ( hash.indexOf( 'sketchfab-' ) !== -1 ) {
				id = parseInt( hash.substring( 'sketchfab-'.length ), 10 );
				type = 'sketchfab';
			}

			if ( id && type ) {
				const item = this.mediaItems.find( ( _item ) => _item.id === id );
				if ( item ) {
					this.setActiveItem( item );
					this.trackEvent( 'permalink' );
				}
				else {
					// if ( type === 'image' ) {
					// 	this.growls.error(
					// 		`We couldn't find the image that was linked. It may have been removed.`,
					// 		`Invalid Image URL`
					// 	);
					// }
					// else if ( type === 'video' ) {
					// 	this.growls.error(
					// 		`We couldn't find the video that was linked. It may have been removed.`,
					// 		`Invalid Video URL`
					// 	);
					// }
					// else if ( type === 'sketchfab' ) {
					// 	this.growls.error(
					// 		`We couldn't find the sketchfab model that was linked. It may have been removed.`,
					// 		`Invalid Sketchfab URL`
					// 	);
					// }
					this.trackEvent( 'permalink-invalid' );
				}
			}
		}
	}

	private createLightbox()
	{
		if ( this.lightbox ) {
			return;
		}

		const elem = document.createElement( 'div' );
		window.document.body.appendChild( elem );

		this.lightbox = new AppMediaBarLightbox( {
			propsData: {
				mediaBar: this,
			}
		} );

		this.lightbox.$mount( elem );
	}

	private destroyLightbox()
	{
		if ( !this.lightbox ) {
			return;
		}

		this.lightbox.$destroy();
		window.document.body.removeChild( this.lightbox.$el );
		this.lightbox = undefined;
	}

	private trackEvent( action: string, label?: string )
	{
		Analytics.trackEvent( 'media-bar', action, label );
	}
}
