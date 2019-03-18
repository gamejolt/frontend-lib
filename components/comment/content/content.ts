import View from '!view!./content.html?style=./content.styl';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { date } from '../../../vue/filters/date';
import { AppTrackEvent } from '../../analytics/track-event.directive';
import { AppFadeCollapse } from '../../fade-collapse/fade-collapse';
import { Comment } from '../comment-model';
import '../comment.styl';
import { AppCommentVideoThumbnail } from '../video/thumbnail/thumbnail';


@View
@Component({
	components: {
		AppFadeCollapse,
		AppCommentVideoThumbnail,
	},
	directives: {
		AppTrackEvent,
	},
	filters: {
		date,
	},
})
export class AppCommentContent extends Vue {
	@Prop(Comment) comment!: Comment;
	@Prop(String) content?: string;

	canToggleContent = false;
	showFullContent = false;
	showAllVideos = false;

	readonly date = date;
}
