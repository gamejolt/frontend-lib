import { Component, Inject, Input, OnChanges, SimpleChanges } from 'ng-metadata/core';
import * as template from '!html-loader!./media-bar.component.html';

import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { Analytics } from '../analytics/analytics.service';

@Component({
	selector: 'gj-media-bar',
	template,
})
export class MediaBarComponent implements OnChanges
{
	@Input() mediaItems: any[];

	private _urlChecked = false;

	activeItem: any | null = null;
	activeIndex: number | null = null;
	isPlaying: number | null = null;

	constructor(
		@Inject( '$location' ) private $location: ng.ILocationService,
		@Inject( 'Screen' ) public screen: Screen,
		@Inject( 'Growls' ) private growls: any,
	)
	{
	}

	ngOnChanges( changes: SimpleChanges )
	{
		if ( changes['mediaItems'] && typeof this.mediaItems !== 'undefined' && !this._urlChecked ) {
			this._checkUrl();
		}
	}

	setActiveItem( item: any )
	{
		let index = item;
		if ( typeof item === 'object' ) {
			index = _.findIndex( this.mediaItems, { id: item.id } );
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

	private _checkUrl()
	{
		this._urlChecked = true;

		// If there is a hash in the URL, let's try to load it in.
		let id: number | undefined;
		const hash = this.$location.hash();
		if ( hash ) {
			let type: string | undefined;
			if ( hash.indexOf( 'screenshot-' ) !== -1 ) {
				id = parseInt( hash.substring( 'screenshot-'.length ) );
				type = 'image';
			}
			else if ( hash.indexOf( 'video-' ) !== -1 ) {
				id = parseInt( hash.substring( 'video-'.length ) );
				type = 'video';
			}
			else if ( hash.indexOf( 'sketchfab-' ) !== -1 ) {
				id = parseInt( hash.substring( 'sketchfab-'.length ) );
				type = 'sketchfab';
			}

			if ( id && type ) {
				const item = _.find( this.mediaItems, { id: id } );
				if ( item ) {
					this.setActiveItem( item );
					this.trackEvent( 'permalink' );
				}
				else {
					if ( type == 'image' ) {
						this.growls.error(
							`We couldn't find the image that was linked. It may have been removed.`,
							`Invalid Image URL`
						);
					}
					else if ( type == 'video' ) {
						this.growls.error(
							`We couldn't find the video that was linked. It may have been removed.`,
							`Invalid Video URL`
						);
					}
					else if ( type == 'sketchfab' ) {
						this.growls.error(
							`We couldn't find the sketchfab model that was linked. It may have been removed.`,
							`Invalid Sketchfab URL`
						);
					}
					this.trackEvent( 'permalink-invalid' );
				}
			}
		}
	}

	private trackEvent( action: string, label?: string )
	{
		Analytics.trackEvent( 'media-bar', action, label );
	}
}
