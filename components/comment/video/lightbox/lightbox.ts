import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as View from '!view!./lightbox.html?style=./lightbox.styl';
import './lightbox-content.styl';

import { Screen } from '../../../screen/screen-service';
import { HistoryTick } from '../../../history-tick/history-tick-service';
import { Comment } from '../../comment-model';
import { CommentVideo } from '../video-model';
import { Environment } from '../../../environment/environment.service';
import { AppStore } from '../../../../vue/services/app/app-store';
import { makeObservableService } from '../../../../utils/vue';
import { AppTrackEvent } from '../../../analytics/track-event.directive.vue';
import { AppTooltip } from '../../../tooltip/tooltip';
import { AppImgResponsive } from '../../../img/responsive/responsive';
import { AppJolticon } from '../../../../vue/components/jolticon/jolticon';
import { AppVideoEmbed } from '../../../video/embed/embed';
import { number } from '../../../../vue/filters/number';
import { AppSocialYoutubeSubscribe } from '../../../social/youtube/subscribe/subscribe';
import { bootstrapShortkey } from '../../../../vue/shortkey';

bootstrapShortkey();

@View
@Component({
	components: {
		AppImgResponsive,
		AppJolticon,
		AppVideoEmbed,
		AppSocialYoutubeSubscribe,
	},
	directives: {
		AppTrackEvent,
		AppTooltip,
	},
	filters: {
		number,
	},
})
export class AppCommentVideoLightbox extends Vue {
	@Prop(CommentVideo) video: CommentVideo;

	@State app: AppStore;

	canVote = true;

	innerElem: Element;
	Screen = makeObservableService(Screen);

	created() {
		HistoryTick.sendBeacon('comment-video', this.video.id);

		// Can't vote on this comment if...
		// they aren't logged in
		// they wrote the comment
		// the resource belongs to them (they will just upvote stuff that is nice)
		this.canVote = true;
		if (!this.app.user) {
			this.canVote = false;
		} else if (this.video.comment.user.id === this.app.user.id) {
			this.canVote = false;
		} else if (this.video.game.developer.id === this.app.user.id) {
			this.canVote = false;
		}
	}

	mounted() {
		// Move it to the body.
		// This should fix the z-indexing and put it on top of the whole shell.
		this.innerElem = this.$refs.inner as Element;
		document.body.appendChild(this.innerElem);
	}

	destroyed() {
		this.innerElem.parentNode!.removeChild(this.innerElem);
	}

	get maxWidth() {
		return this.Screen.isXs ? Screen.width : Screen.width * 0.8;
	}

	get maxHeight() {
		return this.Screen.isXs ? Screen.height : Screen.height - 80 * 2;
	}

	toggleVote() {
		// If adding a vote.
		if (!this.video.comment.user_vote) {
			this.video.comment.$like();
		} else {
			// If removing a vote.
			this.video.comment.$removeLike();
		}
	}

	async reply() {
		let url = await Comment.getCommentUrl(this.video.comment.id);

		const search = Environment.baseUrl;
		if (url.search(search) === 0) {
			url = url.replace(search, '');
		}

		this.$router.push(url);
		this.close();
	}

	close() {
		this.$emit('closed');
	}
}
