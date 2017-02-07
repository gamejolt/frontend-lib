import { Component, Input } from 'ng-metadata/core';
import * as template from '!html-loader!./thumbnail-img.html';

@Component({
	selector: 'gj-game-thumbnail-img',
	template,
})
export class ThumbnailImgComponent
{
	@Input( '<' ) game: any;
}
