import { Component, Inject, Input } from '@angular/core';
import { Fireside_Post } from './../../post-model';
import { Fireside_Post_Like } from './../like-model';
import { App } from './../../../../../../../app/app-service';

@Component({
	selector: 'gj-fireside-post-like-widget',
	templateUrl: '/lib/gj-lib-client/components/fireside/post/like/widget/widget.html',
})
export class WidgetComponent
{
	@Input( '<firesidePost' ) post: Fireside_Post;
	@Input( '<?' ) sparse = false;

	constructor(
		@Inject( 'App' ) public app: App,
		@Inject( 'Fireside_Post_Like' ) private firesidePostLike: typeof Fireside_Post_Like,
		@Inject( 'gettextCatalog' ) private gettextCatalog: ng.gettext.gettextCatalog
	)
	{
	}

	getTooltip()
	{
		// No tooltip if showing label.
		if ( !this.sparse ) {
			return undefined;
		}

		if ( !this.post.user_like ) {
			return this.gettextCatalog.getString( 'Like This Post' );
		}
		else {
			return this.gettextCatalog.getString( 'Liked!' );
		}
	}

	toggleLike()
	{
		if ( !this.post.user_like ) {
			const newLike = new this.firesidePostLike( {
				fireside_post_id: this.post.id
			} );

			newLike.$save().then( () =>
			{
				this.post.user_like = newLike;
				++this.post.like_count;
			} );
		}
		else {
			this.post.user_like.$remove().then( () =>
			{
				this.post.user_like = null;
				--this.post.like_count;
			} );
		}
	}
}
