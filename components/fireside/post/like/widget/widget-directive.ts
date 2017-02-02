import { Component, Inject, Input } from 'ng-metadata/core';
import { FiresidePost } from '../../post-model';
import { FiresidePostLike } from '../like-model';
import { App } from '../../../../../../../app/app-service';

@Component({
	selector: 'gj-fireside-post-like-widget',
	template: require( '!html-loader!./widget.html' ),
})
export class WidgetComponent
{
	@Input( '<firesidePost' ) post: FiresidePost;
	@Input( '<' ) sparse = false;

	constructor(
		@Inject( 'App' ) public app: App,
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
			const newLike = new FiresidePostLike( {
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
