import { ContentContext } from '../content-context';

export type GJContentObjectType =
	| 'text'
	| 'paragraph'
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
	| 'tag'
	| 'heading'
	| 'mention';

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

export type HydrationType = 'media-item-id' | 'game-id' | 'username' | 'community-path';

export type GJHydrationDataEntry = {
	type: HydrationType;
	id: string;
	data: any;
};
