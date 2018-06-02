export abstract class ContentEditorSpan {
	constructor(public start: number, public end: number) {}

	abstract tag: string;
	abstract priority: number;
}
