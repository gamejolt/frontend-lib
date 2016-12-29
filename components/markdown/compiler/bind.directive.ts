import { Directive, OnChanges, SimpleChanges, Input, Output } from '@angular/core';

@Directive({
	selector: '[gj-markdown-compiler-bind]',
})
export class MarkdownCompilerBindDirective implements OnChanges
{
	@Input( '<gjMarkdownCompilerBind' ) content?: string;

	@Output() markdownCompiled: Function;

	constructor()
	{
	}

	ngOnChanges( changes: SimpleChanges )
	{
		if ( changes['content'] && typeof this.content != 'undefined'  ) {

			this.markdownCompiled( {
				$compiledContent: marked( this.content, {
					sanitize: true,
					breaks: false,
					pedantic: true,
				} )
			} );
		}
	}
}
