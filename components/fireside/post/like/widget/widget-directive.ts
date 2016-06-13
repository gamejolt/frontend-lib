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
	@Input( '<' ) likes: Fireside_Post_Like[];
	@Input( '<' ) likesCount: number;
	@Input( '<' ) userLike: Fireside_Post_Like;

	constructor(
		@Inject( 'App' ) private app,
		@Inject( 'Screen' ) private screen,
		@Inject( 'Fireside_Post_Like' ) private firesidePostLike: typeof Fireside_Post_Like
	)
	{
	}

	toggleLike()
	{
		if ( !this.userLike ) {
			const newLike = new this.firesidePostLike( {
				fireside_post_id: this.post.id
			} );

			newLike.$save().then( __ =>
			{
				this.likes.unshift( newLike );
				this.userLike = newLike;
				++this.likesCount;
			} );
		}
		else {
			this.userLike.$remove().then( __ =>
			{
				_.remove( this.likes, { id: this.userLike.id } );
				this.userLike = null;
				--this.likesCount;
			} );
		}
	}
}
