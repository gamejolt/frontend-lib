import { Component, Inject, Input } from 'ng-metadata/core';
import { Fireside_Post } from './../../post-model';
import { Fireside_Post_Like } from './../like-model';

@Component({
	selector: 'gj-fireside-post-like-widget',
	templateUrl: '/lib/gj-lib-client/components/fireside/post/like/widget/widget.html',
})
export class WidgetComponent
{
	@Input( '<firesidePost' ) post: Fireside_Post;
	@Input( '<noAvatars' ) noAvatars: boolean;

	constructor(
		@Inject( 'App' ) private app,
		@Inject( 'Screen' ) private screen,
		@Inject( 'Fireside_Post_Like' ) private firesidePostLike: typeof Fireside_Post_Like
	)
	{
	}

	toggleLike()
	{
		if ( !this.post.user_like ) {
			const newLike = new this.firesidePostLike( {
				fireside_post_id: this.post.id
			} );

			newLike.$save().then( __ =>
			{
				this.post.likes.unshift( newLike );
				this.post.user_like = newLike;
				++this.post.like_count;
			} );
		}
		else {
			this.post.user_like.$remove().then( __ =>
			{
				_.remove( this.post.likes, { id: this.post.user_like.id } );
				this.post.user_like = null;
				--this.post.like_count;
			} );
		}
	}
}
