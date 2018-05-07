import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./like-widget.html';

import { CommentVideo } from '../video-model';
import { AppAuthRequired } from '../../../auth/auth-required-directive.vue';
import { number } from '../../../../vue/filters/number';
import { Screen } from '../../../screen/screen-service';

@View
@Component({
	directives: {
		AppAuthRequired,
	},
})
export class AppCommentVideoLikeWidget extends Vue {
	@Prop(CommentVideo) video: CommentVideo;
	@Prop(Boolean) overlay?: boolean;
	@Prop(Boolean) circle?: boolean;
	@Prop(Boolean) block?: boolean;

	isProcessing = false;

	get comment() {
		return this.video.comment;
	}

	// We also show circle in xs size.
	get isCircle() {
		return this.circle || Screen.isXs;
	}

	get blip() {
		return this.isCircle && this.comment.votes ? number(this.comment.votes) : '';
	}

	get badge() {
		return !this.isCircle && this.comment.votes ? number(this.comment.votes) : '';
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
