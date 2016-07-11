import { Component, Input } from 'ng-metadata/core';
import template from './thumbnail-img.html';

@Component({
	selector: 'gj-game-thumbnail-img',
	template,
})
export class ThumbnailImgComponent
{
	@Input( '<' ) game: any;
}
