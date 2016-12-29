import { Injectable } from '@angular/core';
import { makeModel, Model } from '../model/model.service';

@Injectable()
export class MediaItem extends Model
{
	static readonly TYPE_GAME_THUMBNAIL = 'game-thumbnail';
	static readonly TYPE_GAME_HEADER = 'game-header';
	static readonly TYPE_GAME_SCREENSHOT = 'game-screenshot';
	static readonly TYPE_GAME_TROPHY = 'game-trophy';

	static readonly TYPE_FIRESIDE_POST_HEADER = 'fireside-post-header';
	static readonly TYPE_FIRESIDE_POST_IMAGE = 'fireside-post-image';

	static readonly TYPE_FEATURED_HEADER = 'featured-header';

	static readonly STATUS_ACTIVE = 'active';
	static readonly STATUS_REMOVED = 'removed';

	type: string;
	parent_id: number;
	hash: string;
	filename: string;
	filetype: string;
	is_animated: boolean;
	width: number;
	height: number;
	filesize: number;
	crop_start_x: number;
	crop_start_y: number;
	crop_end_x: number;
	crop_end_y: number;
	added_on: number;
	status: string;
	img_url: string;
	mediaserver_url_webm: string;
	mediaserver_url_mp4: string;
	mediaserver_url: string;

	post_id: number;

	constructor( data?: any )
	{
		super( data );
	}

	getDimensions( maxWidth: number, maxHeight: number, options: any = {} )
	{
		// Simple getter for dimensions.
		if ( !maxWidth && !maxHeight ) {
			return {
				width: this.width,
				height: this.height,
			};
		}
		// This case is a bit silly, but whatever.
		else if ( options && options.force && maxWidth && maxHeight ) {
			return {
				width: maxWidth,
				height: maxHeight,
			};
		}

		const aspectRatio = this.height / this.width;
		let width, height;

		// Forcing one of the dimensions is easy.
		if ( options && options.force ) {
			width = maxWidth || height / aspectRatio;
			height = maxHeight || width * aspectRatio;
		}
		else {
			// Setting max for both.
			if ( maxWidth && maxHeight ) {
				width = Math.min( this.width, maxWidth );
				height = width * aspectRatio;

				if ( height > maxHeight ) {
					height = maxHeight;
					width = height / aspectRatio;
				}
			}
			else if ( maxWidth && !maxHeight ) {
				width = Math.min( this.width, maxWidth );
				height = width * aspectRatio;
			}
			else if ( !maxWidth && maxHeight ) {
				height = Math.min( this.height, maxHeight );
				width = height / aspectRatio;
			}
		}

		return {
			width: width,
			height: height,
		};
	}

	getCrop()
	{
		if ( !this.crop_end_x || !this.crop_end_y ) {
			return undefined;
		}

		return {
			x: this.crop_start_x,
			y: this.crop_start_y,
			x2: this.crop_end_x,
			y2: this.crop_end_y,
		};
	}

	async $save()
	{
		if ( this.type !== MediaItem.TYPE_FIRESIDE_POST_IMAGE
			&& this.type !== MediaItem.TYPE_FIRESIDE_POST_HEADER ) {
			throw new Error( `Can only save fireside media items.` );
		}

		if ( !this.id ) {
			return this.$_save(
				'/fireside/dash/posts/media/upload/' + this.post_id + '/' + this.type,
				'mediaItem',
				{ file: this.file },
			);
		}

		throw new Error( `Can't edit media item.` );
	}

	async $remove()
	{
		if ( this.type !== MediaItem.TYPE_FIRESIDE_POST_IMAGE
			&& this.type !== MediaItem.TYPE_FIRESIDE_POST_HEADER ) {
			throw new Error( `Can only save fireside media items.` );
		}

		return this.$_remove( '/fireside/dash/posts/media/remove/' + this.id );
	}
}

const deps = {};
export const provideMediaItem = makeModel( MediaItem, deps );
