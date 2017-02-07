import { Component, Input } from 'ng-metadata/core';
import { CommentVideo } from '../video-model';
import * as template from '!html-loader!./thumbnail.html';

@Component({
	selector: 'gj-comment-video-thumbnail',
	template,
})
export class ThumbnailComponent {
	@Input( '<' ) video: CommentVideo;
	@Input( '<' ) showUser: boolean;
	@Input( '<' ) showGame: boolean;
}
