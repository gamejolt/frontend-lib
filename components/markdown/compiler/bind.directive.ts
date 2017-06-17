import {
	Directive,
	OnChanges,
	SimpleChanges,
	Input,
	Output,
	EventEmitter,
} from 'ng-metadata/core';

@Directive({
	selector: '[gj-markdown-compiler-bind]',
})
export class MarkdownCompilerBindDirective implements OnChanges {
	@Input('<gjMarkdownCompilerBind') content?: string;

	@Output() private markdownCompiled = new EventEmitter<string>();

	constructor() {}

	ngOnChanges(changes: SimpleChanges) {
		if (changes['content'] && typeof this.content != 'undefined') {
			this.markdownCompiled.emit(
				window.marked(this.content, {
					sanitize: true,
					breaks: false,
					pedantic: true,
				}),
			);
		}
	}
}
