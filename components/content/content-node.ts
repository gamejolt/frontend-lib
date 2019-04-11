import { ContentObject, ContentObjectType } from './content-object';

export abstract class ContentNode {
	protected _content: ContentObject[];

	get content(): ReadonlyArray<ContentObject> {
		return this._content;
	}

	get hasChildren() {
		return this.content.length > 0;
	}

	get lastChild() {
		if (!this.hasChildren) {
			return null;
		}
		return this.content[this.content.length - 1];
	}

	get firstChild() {
		if (!this.hasChildren) {
			return null;
		}
		return this.content[0];
	}

	constructor(content: ContentObject[] = []) {
		this._content = content;
	}

	public getChildrenByType(type: ContentObjectType): ContentObject[] {
		const objs = [] as ContentObject[];
		for (const contentObj of this.content) {
			const subObjs = contentObj.getChildrenByType(type);
			objs.push(...subObjs);
			if (contentObj.type === type) {
				objs.push(contentObj);
			}
		}
		return objs;
	}

	public appendChild(child: ContentObject) {
		this._content.push(child);
	}
}
