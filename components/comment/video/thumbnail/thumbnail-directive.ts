import { Component, Input } from 'ng-metadata/core';
import { Comment_Video } from '../video-model';
import template from './thumbnail.html';

@Component({
	selector: 'gj-comment-video-thumbnail',
	template,
})
export class ThumbnailComponent {
	@Input( '<' ) video: Comment_Video;
	@Input( '<' ) showUser: boolean;
	@Input( '<' ) showGame: boolean;
}
