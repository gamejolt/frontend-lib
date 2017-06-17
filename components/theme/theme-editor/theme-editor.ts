import { NgModule } from 'ng-metadata/core';
import { CodemirrorModule } from '../../codemirror/codemirror.module';
import { ThemeEditorComponent } from './theme-editor.component';
import { ThemeEditorFontSelectorComponent } from './font-selector.component';
import { ThemeEditorImageComponent } from './image.component';
import { ThemeEditorImageFormFactory } from './image-form.component';

export default angular
	.module('App.Theme.Editor', [])
	.directive('gjThemeEditorImageForm', ThemeEditorImageFormFactory).name;

@NgModule({
	imports: ['App.Theme.Editor', 'gj.Colorpicker', CodemirrorModule],
	declarations: [
		ThemeEditorComponent,
		ThemeEditorFontSelectorComponent,
		ThemeEditorImageComponent,
	],
})
export class ThemeEditorModule {}
