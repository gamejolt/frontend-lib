import { provide } from 'ng-metadata/core';
import { ContentBlockEditorComponent } from './editor.component';
import { ContentBlockEditorFormFactory } from './editor-form.component';

export default angular.module( 'gj.ContentBlock.Editor', [] )
.directive( 'gjContentBlockEditorForm', ContentBlockEditorFormFactory )
.directive( ...provide( ContentBlockEditorComponent ) )
.name;
