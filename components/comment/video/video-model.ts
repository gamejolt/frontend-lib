import { Injectable } from 'ng-metadata/core';
import { Model } from './../../model/model-service';
import { Comment } from './../comment-model';

export function Comment_VideoFactory( Model, $injector, Game )
{
	return Model.create( Comment_Video, {
		$injector,
		Game,
	} );
}

@Injectable()
export class Comment_Video extends Model
{
	provider: string;
	provider_video_id: string;
	img_thumbnail: string;
	youtube_channel: string;

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
