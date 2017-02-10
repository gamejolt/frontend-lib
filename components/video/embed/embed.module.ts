import { NgModule } from 'ng-metadata/core';
import { makeComponentProvider } from '../../../vue/angular-link';
import { AppVideoEmbed } from './embed';

@NgModule({
	declarations: [
		makeComponentProvider( AppVideoEmbed ),
	],
})
export class VideoEmbedModule { }
