import { Injectable } from '@angular/core';
import { Model } from './../../../model/model-service';

export function Fireside_Post_VideoFactory( Model: any )
{
	return Model.create( Fireside_Post_Video, {
	} );
}

@Injectable()
export class Fireside_Post_Video extends Model
{
	static PROVIDER_YOUTUBE = 'youtube';

	fireside_post_id: number;
	provider: 'youtube';
	video_id: string;
	thumbnail_url: string;
}
