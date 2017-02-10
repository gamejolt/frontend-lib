import { NgModule } from 'ng-metadata/core';
import { makeComponentProvider } from '../../../vue/angular-link';
import { AppSketchfabEmbed } from './embed';

@NgModule({
	declarations: [
		makeComponentProvider( AppSketchfabEmbed ),
	],
})
export class SketchfabEmbedModule { }
