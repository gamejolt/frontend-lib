import {
	ContentObject,
	ContentObjectType,
} from 'game-jolt-frontend-lib/components/content/content-object';

export abstract class ContentNode {
	public content: ContentObject[];

	get lastChild() {
		if (this.content.length === 0) {
			return null;
		}
		return this.content[this.content.length - 1];
	}

	constructor(content: ContentObject[] = []) {
		this.content = content;
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
		this.content.push(child);
	}
}
