import { Injectable } from 'ng-metadata/core';
import { Model } from './../../../model/model-service';

export function Fireside_Post_LikeFactory( User, Model )
{
	return Model.create( Fireside_Post_Like, {
		User,
	} );
}

@Injectable()
export class Fireside_Post_Like extends Model
{
	fireside_post_id: number;
	user_id: number;
	// user: gj.User;
	user: any;
	added_on: number;

	static User: any;

	constructor( data?: any )
	{
		super( data );

		if ( data && data.user ) {
			this.user = new Fireside_Post_Like.User( data.user );
		}
	}

	$save()
	{
		if ( !this.id ) {
			return this.$_save( '/fireside/posts/like/' + this.fireside_post_id, 'firesidePostLike', { ignorePayloadUser: true } );
		}
	}

	$remove()
	{
		return this.$_remove( '/fireside/posts/unlike/' + this.fireside_post_id, { ignorePayloadUser: true } );
	}
}
