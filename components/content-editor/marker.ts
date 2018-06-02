import { ContentEditorSpan } from './span/index';

export class ContentEditorMarker {
	constructor(public pos: number, public span: ContentEditorSpan) {}

	get isStart() {
		return this.span.start === this.pos;
	}

	get isEnd() {
		return this.span.end === this.pos;
	}
}
