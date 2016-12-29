import { Injectable } from '@angular/core';
import { makeModel, Model } from '../../model/model.service';
import { Api } from '../../api/api.service';
import { MediaItem } from '../../media-item/media-item.model';

@Injectable()
export class GameScreenshot extends Model
{
	static Api: Api;
	static MediaItem: typeof MediaItem;

	media_type: 'image' = 'image';
	game_id: number;
	caption: string;
	posted_on: number;
	status: number;

	img_thumbnail: string;
	img_thumbnail_med: string;
	img_thumbnail_large: string;

	media_item: MediaItem;

	constructor( data?: any )
	{
		super( data );

		if ( data.media_item ) {
			this.media_item = new GameScreenshot.MediaItem( data.media_item );
		}
	}

	getUrl( game: Game )
	{
		return game.getUrl() + '#screenshot-' + this.id;
	}

	async $save()
	{
		let response: any;
		if ( !this.id ) {

			// When adding, we add multiple, so we can't treat it like a normal model save.
			response = await GameScreenshot.Api.sendRequest(
				'/web/dash/developer/games/media/save/image/' + this.game_id,
				this,
				{ file: this.file },
			);

			if ( response.success ) {
				return response;
			}
			return Promise.reject( response );
		}

		return this.$_save(
			'/web/dash/developer/games/media/save/image/' + this.game_id + '/' + this.id,
			'gameScreenshot',
		);
	}

	async $remove()
	{
		return this.$_remove(
			'/web/dash/developer/games/media/remove/image/' + this.game_id + '/' + this.id,
		);
	}
}

const deps = { Api, MediaItem };
export const provideGameScreenshot = makeModel( GameScreenshot, deps );
