import { ContentNode } from 'game-jolt-frontend-lib/components/content/content-node';
import { MarkObject } from 'game-jolt-frontend-lib/components/content/mark-object';

export type ContentObjectType =
	| 'text'
	| 'paragraph'
	| 'table'
	| 'tableRow'
	| 'tableCell'
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

export class ContentObject extends ContentNode {
	public type!: ContentObjectType;
	public text!: string | null;
	public attrs!: { [key: string]: any };
	public marks!: MarkObject[];

	constructor(type: ContentObjectType) {
		super();

		this.type = type;

		this.text = null;
		this.attrs = {};
		this.marks = [];
	}

	public get hasContent() {
		// hr and hard break do not count as "content".
		switch (this.type) {
			case 'text':
				return typeof this.text === 'string' && this.text.length > 0;
			// The following types are automatically considered content:
			case 'mention':
			case 'tag':
			case 'gjEmoji':
			case 'embed':
			case 'mediaItem':
				return true;
		}

		for (const child of this.content) {
			if (child.hasContent) {
				return true;
			}
		}

		return false;
	}

	public static fromJsonObj(jsonObj: any): ContentObject {
		const type = jsonObj.type as ContentObjectType;
		const obj = new ContentObject(type);

		if (typeof jsonObj.text === 'string') {
			obj.text = jsonObj.text;
		} else {
			obj.text = null;
		}

		if (jsonObj.attrs === undefined) {
			obj.attrs = {};
		} else {
			obj.attrs = jsonObj.attrs;
		}

		obj._content = [];
		if (Array.isArray(jsonObj.content)) {
			for (const subJsonObj of jsonObj.content) {
				obj.appendChild(ContentObject.fromJsonObj(subJsonObj));
			}
		}

		obj.marks = [];
		if (Array.isArray(jsonObj.marks)) {
			for (const subJsonObj of jsonObj.marks) {
				obj.marks.push(MarkObject.fromJsonObj(subJsonObj));
			}
		}

		return obj;
	}

	public toJsonObj(): any {
		const jsonObj = {} as any;

		jsonObj.type = this.type;

		if (this.attrs !== undefined && Object.keys(this.attrs).length > 0) {
			jsonObj.attrs = this.attrs;
		}

		if (this.text !== null) {
			jsonObj.text = this.text;
		}

		if (this.content.length > 0) {
			jsonObj.content = this.content.map(i => i.toJsonObj());
		}

		if (this.marks.length > 0) {
			jsonObj.marks = this.marks.map(i => i.toJsonObj());
		}

		return jsonObj;
	}
}
