import { Component, Input } from '@angular/core';
import template from 'html!./thumbnail-img.html';

@Component({
	selector: 'gj-game-thumbnail-img',
	template,
})
export class ThumbnailImgComponent
{
	@Input( '<' ) game: any;
}
