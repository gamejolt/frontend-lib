import { provide } from 'ng-metadata/core';
import { MarkdownCompilerBindDirective } from './bind.directive';

export default angular
	.module('gj.Markdown.Compiler', [])
	.directive(...provide(MarkdownCompilerBindDirective)).name;
