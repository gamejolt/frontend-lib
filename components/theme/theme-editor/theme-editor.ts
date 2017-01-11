import { provide } from 'ng-metadata/core';
import { ThemeEditorComponent } from './theme-editor.component';
import { ThemeEditorFontSelectorComponent } from './font-selector.component';
import { ThemeEditorImageComponent } from './image.component';
import { ThemeEditorImageFormFactory } from './image-form.component';

export default angular.module( 'App.Theme.Editor', [ 'gj.Colorpicker' ] )
.directive( 'gjThemeEditorImageForm', ThemeEditorImageFormFactory )
.directive( ...provide( ThemeEditorComponent ) )
.directive( ...provide( ThemeEditorFontSelectorComponent ) )
.directive( ...provide( ThemeEditorImageComponent ) )
.name;
