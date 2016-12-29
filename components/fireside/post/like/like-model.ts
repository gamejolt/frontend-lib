import { Injectable } from '@angular/core';
import { Model } from './../../../model/model-service';

export function Fireside_Post_LikeFactory( $q: any, User: any, Model: any )
{
	return Model.create( Fireside_Post_Like, {
		$q,
		User,
	} );
}

@Injectable()
export class Fireside_Post_Like extends Model
{
	static User: any;
	static $q: angular.IQService;

	fireside_post_id: number;
	user_id: number;
	// user: gj.User;
	user: any;
	added_on: number;

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
		return Fireside_Post_Like.$q.reject();
	}

	$remove()
	{
		return this.$_remove( '/fireside/posts/unlike/' + this.fireside_post_id, { ignorePayloadUser: true } );
	}
}
