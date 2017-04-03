import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./thumbnail.html?style=./thumbnail.styl';

import { CommentVideo } from '../video-model';
import { AppJolticon } from '../../../../vue/components/jolticon/jolticon';
import { AppTrackEvent } from '../../../analytics/track-event.directive.vue';
import { AppTooltip } from '../../../tooltip/tooltip';
import { AppGameThumbnailImg } from '../../../game/thumbnail-img/thumbnail-img';
import { AppCommentVideoLightbox } from '../lightbox/lightbox';

@View
@Component({
	components: {
		AppJolticon,
		AppGameThumbnailImg,
		AppCommentVideoLightbox,
	},
	directives: {
		AppTrackEvent,
		AppTooltip,
	},
})
export class AppCommentVideoThumbnail extends Vue
{
	@Prop( CommentVideo ) video: CommentVideo;
	@Prop( Boolean ) showUser?: boolean;
	@Prop( Boolean ) showGame?: boolean;

	isLightboxActive = false;
}
