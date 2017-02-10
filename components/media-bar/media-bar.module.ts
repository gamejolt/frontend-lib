import { NgModule } from 'ng-metadata/core';
import { makeComponentProvider } from '../../vue/angular-link';
import { AppMediaBar } from './media-bar';

@NgModule({
	declarations: [
		makeComponentProvider( AppMediaBar ),
	],
})
export class MediaBarModule { }
