import View from '!view!./modal.html?style=./modal.styl';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';

import { AppGameThumbnail } from '../../../../../../_common/game/thumbnail/thumbnail';
import { AppJolticon } from '../../../../vue/components/jolticon/jolticon';
import { number } from '../../../../vue/filters/number';
import { AppStore } from '../../../../vue/services/app/app-store';
import { AppTrackEvent } from '../../../analytics/track-event.directive.vue';
import { AppFadeCollapse } from '../../../fade-collapse/fade-collapse';
import { BaseModal } from '../../../modal/base';
import { AppResponsiveDimensions } from '../../../responsive-dimensions/responsive-dimensions';
import { Screen } from '../../../screen/screen-service';
import { AppUserFollowWidget } from '../../../user/follow-widget/follow-widget';
import { AppUserAvatar } from '../../../user/user-avatar/user-avatar';
import { AppVideoEmbed } from '../../../video/embed/embed';
import { AppCommentVideoLikeWidget } from '../like-widget/like-widget';
import { CommentVideo } from '../video-model';

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

	readonly Screen = Screen;

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
		} else if (this.video.game.hasPerms()) {
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
