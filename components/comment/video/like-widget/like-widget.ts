import Vue from 'vue';
import { State } from 'vuex-class';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./like-widget.html';

import { CommentVideo } from '../video-model';
import { AppStore } from '../../../../vue/services/app/app-store';
import { AppJolticon } from '../../../../vue/components/jolticon/jolticon';
import { AppAuthRequired } from '../../../auth/auth-required-directive.vue';
import { number } from '../../../../vue/filters/number';

@View
@Component({
	components: {
		AppJolticon,
	},
	directives: {
		AppAuthRequired,
	},
	filters: {
		number,
	},
})
export class AppCommentVideoLikeWidget extends Vue {
	@Prop(CommentVideo) video: CommentVideo;
	@Prop(Boolean) sparse?: boolean;
	@Prop(Boolean) circle?: boolean;

	@State app: AppStore;

	isProcessing = false;

	get comment() {
		return this.video.comment;
	}

	get canVote() {
		// Can't vote on this comment if...
		// they aren't logged in
		// they wrote the comment
		// the resource belongs to them (they will just upvote stuff that is nice)
		if (!this.app.user) {
			return false;
		} else if (this.video.comment.user.id === this.app.user.id) {
			return false;
		} else if (this.video.game.hasPerms()) {
			return false;
		}

		return true;
	}

	async toggle() {
		this.isProcessing = true;

		if (!this.comment.user_vote) {
			await this.comment.$like();
		} else {
			await this.comment.$removeLike();
		}

		this.isProcessing = false;
	}
}
