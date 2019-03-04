import { ContentContext } from '../content-context';

export type GJContentObjectType =
	| 'text'
	| 'paragraph'
	| 'img'
	| 'table'
	| 'hr'
	| 'codeBlock'
	| 'gjEmoji'
	| 'blockquote'
	| 'hardBreak'
	| 'embed'
	| 'mediaItem'
	| 'orderedList'
	| 'bulletList'
	| 'listItem'
	| 'spoiler'
	| 'table'
	| 'tag';

export type GJContentFormat = {
	version: string;
	createdOn: number;
	context: ContentContext;
	content: GJContentObject[];
	hydration: GJHydrationDataEntry[];
};

export type GJContentObject = {
	type: GJContentObjectType;
	text: string;
	content: GJContentObject[];
	attrs: { [key: string]: any };
	marks: { [key: string]: any };
};

export type ProsemirrorEditorFormat = {
	type: 'doc';
	content: GJContentObject[];
};

export type GJHydrationDataEntry = {
	type: string;
	id: string;
	data: any;
};
