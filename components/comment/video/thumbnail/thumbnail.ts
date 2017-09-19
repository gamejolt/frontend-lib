import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./thumbnail.html?style=./thumbnail.styl';
import './thumbnail-content.styl';

import { CommentVideo } from '../video-model';
import { AppJolticon } from '../../../../vue/components/jolticon/jolticon';
import { AppTrackEvent } from '../../../analytics/track-event.directive.vue';
import { AppTooltip } from '../../../tooltip/tooltip';
import { CommentVideoModal } from '../modal/modal.service';
import { AppUserAvatar } from '../../../user/user-avatar/user-avatar';
import { AppUserFollowWidget } from '../../../user/follow-widget/follow-widget';

@View
@Component({
	components: {
		AppJolticon,
		AppUserAvatar,
		AppUserFollowWidget,
	},
	directives: {
		AppTrackEvent,
		AppTooltip,
	},
})
export class AppCommentVideoThumbnail extends Vue {
	@Prop(CommentVideo) video: CommentVideo;
	@Prop(Boolean) hideFollow?: boolean;

	isLoaded = false;

	get comment() {
		return this.video.comment;
	}

	get user() {
		return this.comment.user;
	}

	showModal() {
		CommentVideoModal.show(this.video);
	}

	onThumbLoaded() {
		this.isLoaded = true;
	}
}
