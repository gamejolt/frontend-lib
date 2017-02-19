import { NgModule } from 'ng-metadata/core';
import { makeComponentProvider } from '../../../vue/angular-link';
import { AppGameThumbnailImg } from './thumbnail-img';

@NgModule({
	declarations: [
		makeComponentProvider( AppGameThumbnailImg ),
	],
})
export class GameThumbnailImgModule { }
