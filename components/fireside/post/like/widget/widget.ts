import View from '!view!./widget.html';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { number } from '../../../../../vue/filters/number';
import { AppAuthRequired } from '../../../../auth/auth-required-directive.vue';
import { Growls } from '../../../../growls/growls.service';
import { LikersModal } from '../../../../likers/modal.service';
import { Screen } from '../../../../screen/screen-service';
import { AppTooltip } from '../../../../tooltip/tooltip';
import { FiresidePost } from '../../post-model';
import { FiresidePostLike } from '../like-model';

@View
@Component({
	directives: {
		AppAuthRequired,
		AppTooltip,
	},
})
export class AppFiresidePostLikeWidget extends Vue {
	@Prop(FiresidePost)
	post!: FiresidePost;
	@Prop(Boolean)
	overlay?: boolean;
	@Prop(Boolean)
	circle?: boolean;
	@Prop(Boolean)
	block?: boolean;

	isProcessing = false;

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
		if (this.isProcessing) {
			return;
		}

		this.isProcessing = true;

		const currentLike = this.post.user_like;
		if (!currentLike) {
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

		this.isProcessing = false;
	}

	showLikers() {
		LikersModal.show({ count: this.post.like_count, resource: this.post });
	}
}
