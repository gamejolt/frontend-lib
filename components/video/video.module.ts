import { NgModule } from 'ng-metadata/core';
import { makeComponentProvider } from '../../vue/angular-link';
import { AppVideo } from './video';

@NgModule({
	declarations: [
		makeComponentProvider( AppVideo ),
	],
})
export class VideoModule { }
