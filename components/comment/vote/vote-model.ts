import { Injectable } from 'ng-metadata/core';
import { Model } from './../../model/model-service';

export function Comment_VoteFactory( Model: any )
{
	return Model.create( Comment_Vote );
}

@Injectable()
export class Comment_Vote extends Model
{
	comment_id: number;
	user_id: number;
	posted_on: number;

	$save()
	{
		return this.$_save( '/comments/votes/add/' + this.comment_id, 'commentVote', { ignorePayloadUser: true } );
	}

	$remove()
	{
		return this.$_remove( '/comments/votes/remove/' + this.id, { ignorePayloadUser: true } );
	}
}
