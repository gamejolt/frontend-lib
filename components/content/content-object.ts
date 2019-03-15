import { MarkObject } from 'game-jolt-frontend-lib/components/content/mark-object';

export type ContentObjectType =
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

export class ContentObject {
	public type!: ContentObjectType;
	public text!: string;
	public content!: ContentObject[];
	public attrs!: { [key: string]: any };
	public marks!: MarkObject[];
}
