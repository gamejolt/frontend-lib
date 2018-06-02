import { ContentEditorSpan } from './index';

export class ContentEditorSpanLink extends ContentEditorSpan {
	tag = 'a';
	priority = 3;

	constructor(start: number, end: number, public url: string) {
		super(start, end);
	}
}
