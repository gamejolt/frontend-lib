import { ContentContext } from 'game-jolt-frontend-lib/components/content/content-context';
import { ContentHydrationDataEntry } from 'game-jolt-frontend-lib/components/content/content-hydrator';
import {
	ContentObject,
	ContentObjectType,
} from 'game-jolt-frontend-lib/components/content/content-object';

const GJ_FORMAT_VERSION = '1.0.0';

export class ContentContainer {
	public version: string;
	public createdOn: number;
	public context: ContentContext;
	public content: ContentObject[];
	public hydration: ContentHydrationDataEntry[];

	constructor(context: ContentContext, content: ContentObject[] = []) {
		this.version = GJ_FORMAT_VERSION;
		this.createdOn = Date.now();
		this.context = context;
		this.content = content;
		this.hydration = [];
	}

	public static fromJson(json: string): ContentContainer {
		if (!json) {
			throw new Error('Empty json provided.');
		}

		const jsonObj = JSON.parse(json);

		const context = jsonObj.context;
		const content = [];
		if (Array.isArray(jsonObj.content)) {
			for (const subJsonObj of jsonObj.content) {
				content.push(ContentObject.fromJsonObj(subJsonObj));
			}
		}

		const obj = new ContentContainer(context, content);

		obj.version = jsonObj.version;
		obj.hydration = [];
		obj.createdOn = jsonObj.createdOn;

		return obj;
	}

	public toJson() {
		const data = {
			version: this.version,
			createdOn: this.createdOn,
			context: this.context,
			content: this.content.map(i => i.toJsonObj()),
			hydration: [],
		};
		return JSON.stringify(data);
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
