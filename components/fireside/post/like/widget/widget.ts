import Vue from 'vue';
import { State } from 'vuex-class';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./widget.html?style=./widget.styl';

import { FiresidePost } from '../../post-model';
import { FiresidePostLike } from '../like-model';
import { AppState } from '../../../../../vue/services/app/app-store';
import { AppJolticon } from '../../../../../vue/components/jolticon/jolticon';
import { AppAuthRequired } from '../../../../auth/auth-required-directive.vue';
import { AppTooltip } from '../../../../tooltip/tooltip';
import { number } from '../../../../../vue/filters/number';

@View
@Component({
	components: {
		AppJolticon,
	},
	directives: {
		AppAuthRequired,
		AppTooltip,
	},
	filters: {
		number,
	},
})
export class AppFiresidePostLikeWidget extends Vue
{
	@Prop( FiresidePost ) post: FiresidePost;
	@Prop( Boolean ) sparse?: boolean;
	@Prop( Boolean ) circle?: boolean;

	@State app: AppState;

	get tooltip()
	{
		// No tooltip if showing label.
		if ( !this.isSparse ) {
			return undefined;
		}

		if ( !this.post.user_like ) {
			return this.$gettext( 'Like This Post' );
		}
		else {
			return this.$gettext( 'Liked!' );
		}
	}

	/**
	 * Combined sparse or circle option.
	 */
	get isSparse()
	{
		return this.sparse || this.circle;
	}

	async toggleLike()
	{
		if ( !this.post.user_like ) {
			const newLike = new FiresidePostLike( {
				fireside_post_id: this.post.id
			} );

			await newLike.$save();
			this.post.user_like = newLike;
			++this.post.like_count;
		}
		else {
			await this.post.user_like.$remove();
			this.post.user_like = null;
			--this.post.like_count;
		}
	}
}
