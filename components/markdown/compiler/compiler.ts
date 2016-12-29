import { provide } from '@angular/core';
import { MarkdownCompilerBindDirective } from './bind.directive';

export default angular.module( 'gj.Markdown.Compiler', [] )
.directive( ...provide( MarkdownCompilerBindDirective ) )
.name;
