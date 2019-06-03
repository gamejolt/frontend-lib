import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class/lib/bindings';
import { Store } from '../../../../../../../auth/store/index';
import { number } from '../../../../../vue/filters/number';
import { AppAuthRequired } from '../../../../auth/auth-required-directive';
import { Growls } from '../../../../growls/growls.service';
import { LikersModal } from '../../../../likers/modal.service';
import AppPopper from '../../../../popper/popper.vue';
import { Screen } from '../../../../screen/screen-service';
import { AppTooltip } from '../../../../tooltip/tooltip';
import UserFollowSuggestion from '../../../../user/follow/suggestion.service';
import AppUserFollowWidget from '../../../../user/follow/widget.vue';
import { FiresidePost } from '../../post-model';
import { FiresidePostLike } from '../like-model';

@Component({
	components: {
		AppUserFollowWidget,
		AppPopper,
	},
	directives: {
		AppAuthRequired,
		AppTooltip,
	},
})
export default class AppFiresidePostLikeWidget extends Vue {
	@Prop(FiresidePost)
	post!: FiresidePost;

	@Prop(Boolean)
	overlay?: boolean;

	@Prop(Boolean)
	circle?: boolean;

	@Prop(Boolean)
	block?: boolean;

	@Prop(Boolean)
	showUserFollow?: boolean;

	@State
	app!: Store['app'];

	isShowingFollowPopover = false;

	get shouldShowFollow() {
		if (!this.showUserFollow) {
			return false;
		}

		if (
			(this.app.user && this.app.user.id === this.post.user.id) ||
			this.post.user.is_following
		) {
			return false;
		}

		return true;
	}

	// We also show circle in xs size.
	get isCircle() {
		return this.circle || Screen.isXs;
	}

	get blip() {
		return this.isCircle && this.post.like_count ? number(this.post.like_count) : '';
	}

	get badge() {
		return !this.isCircle && this.post.like_count ? number(this.post.like_count) : '';
	}

	get tooltip() {
		// No tooltip if showing label.
		if (!this.isCircle) {
			return undefined;
		}

		if (!this.post.user_like) {
			return this.$gettext('Like This Post');
		} else {
			return this.$gettext('Liked!');
		}
	}

	async toggleLike() {
		const currentLike = this.post.user_like;
		if (!currentLike) {
			// Do this before attempting to follow.
			// We don't want to wait till the follow is confirmed to show the dialog,
			// and even if the follow fails it's not like we'll close it.
			if (this.shouldShowFollow && UserFollowSuggestion.canSuggest(this.post.user.id)) {
				this.isShowingFollowPopover = true;
			}

			const newLike = new FiresidePostLike({
				fireside_post_id: this.post.id,
			});

			this.post.user_like = newLike;
			++this.post.like_count;

			try {
				await newLike.$save();
			} catch (e) {
				this.post.user_like = null;
				--this.post.like_count;
				Growls.error(`Can't do that now. Try again later?`);
			}
		} else {
			this.post.user_like = null;
			--this.post.like_count;

			try {
				await currentLike.$remove();
			} catch (e) {
				this.post.user_like = currentLike;
				++this.post.like_count;
				Growls.error(`Can't do that now. Try again later?`);
			}
		}
	}

	showLikers() {
		LikersModal.show({ count: this.post.like_count, resource: this.post });
	}

	onFollowPopoverDismissed() {
		if (!this.post.user.is_following) {
			UserFollowSuggestion.dontSuggest(this.post.user.id);
		}
	}
}
