import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as View from '!view!./modal.html?style=./modal.styl';

import { BaseModal } from '../../../modal/base';
import { CommentVideo } from '../video-model';
import { Screen } from '../../../screen/screen-service';
import { makeObservableService } from '../../../../utils/vue';
import { AppResponsiveDimensions } from '../../../responsive-dimensions/responsive-dimensions';
import { AppVideoEmbed } from '../../../video/embed/embed';
import { AppFadeCollapse } from '../../../fade-collapse/fade-collapse';
import { AppGameThumbnail } from '../../../../../../app/components/game/thumbnail/thumbnail';
import { AppUserAvatar } from '../../../user/user-avatar/user-avatar';
import { AppTrackEvent } from '../../../analytics/track-event.directive.vue';
import { AppJolticon } from '../../../../vue/components/jolticon/jolticon';
import { AppSocialYoutubeSubscribe } from '../../../social/youtube/subscribe/subscribe';
import { HistoryTick } from '../../../history-tick/history-tick-service';
import { AppStore } from '../../../../vue/services/app/app-store';
import { number } from '../../../../vue/filters/number';
import { AppCommentVideoLikeWidget } from '../like-widget/like-widget';
import { AppUserFollowWidget } from '../../../user/follow-widget/follow-widget';

@View
@Component({
	components: {
		AppJolticon,
		AppResponsiveDimensions,
		AppVideoEmbed,
		AppFadeCollapse,
		AppGameThumbnail,
		AppUserAvatar,
		AppUserFollowWidget,
		AppSocialYoutubeSubscribe,
		AppCommentVideoLikeWidget,
	},
	directives: {
		AppTrackEvent,
	},
	filters: {
		number,
	},
})
export default class AppCommentVideoModal extends BaseModal {
	@Prop(CommentVideo) video: CommentVideo;

	@State app: AppStore;

	Screen = makeObservableService(Screen);

	canToggleDescription = false;
	showFullDescription = true;

	created() {
		this.video.$viewed();
	}

	get comment() {
		return this.video.comment;
	}

	get user() {
		return this.comment.user;
	}

	get game() {
		return this.video.game;
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
		} else if (this.video.game.developer.id === this.app.user.id) {
			return false;
		}

		return true;
	}

	toggleVote() {
		// If adding a vote.
		if (!this.comment.user_vote) {
			this.comment.$like();
		} else {
			// If removing a vote.
			this.comment.$removeLike();
		}
	}
}
