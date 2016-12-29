import { Injectable } from '@angular/core';
import { Model } from './../../model/model-service';
import { Comment } from './../comment-model';

export function Comment_VideoFactory( Model: any, $injector: any, Game: any )
{
	return Model.create( Comment_Video, {
		$injector,
		Game,
	} );
}

@Injectable()
export class Comment_Video extends Model
{
	video_id: string;
	channel_id: string;
	img_thumbnail: string;

	comment: Comment;
	game: any;

	static $injector: any;
	static Game: any;

	constructor( data?: any )
	{
		super( data );

		const comment: typeof Comment = Comment_Video.$injector.get( 'Comment' );

		if ( data && data.comment ) {
			this.comment = new comment( data.comment );
		}

		if ( data && data.game ) {
			this.game = new Comment_Video.Game( data.game );
		}
	}
}
