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
	public text!: string | null;
	public content!: ContentObject[];
	public attrs!: { [key: string]: any };
	public marks!: MarkObject[];

	constructor(type: ContentObjectType) {
		this.type = type;

		this.text = null;
		this.content = [];
		this.attrs = {};
		this.marks = [];
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

		obj.content = [];
		if (Array.isArray(jsonObj.content)) {
			for (const subJsonObj of jsonObj.content) {
				obj.content.push(ContentObject.fromJsonObj(subJsonObj));
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

	public getObjectsByType(type: ContentObjectType): ContentObject[] {
		const objs = [] as ContentObject[];
		for (const contentObj of this.content) {
			const subObjs = contentObj.getObjectsByType(type);
			objs.push(...subObjs);
			if (contentObj.type === type) {
				objs.push(contentObj);
			}
		}
		return objs;
	}
}
