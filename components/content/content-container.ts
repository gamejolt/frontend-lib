import { ContentContext } from 'game-jolt-frontend-lib/components/content/content-context';
import { ContentHydrationDataEntry } from 'game-jolt-frontend-lib/components/content/content-hydrator';
import { ContentNode } from 'game-jolt-frontend-lib/components/content/content-node';
import { ContentObject } from 'game-jolt-frontend-lib/components/content/content-object';

const GJ_FORMAT_VERSION = '1.0.0';

export class ContentContainer extends ContentNode {
	public version: string;
	public createdOn: number;
	public context: ContentContext;
	public hydration: ContentHydrationDataEntry[];

	constructor(context: ContentContext, content: ContentObject[] = []) {
		super(content);

		this.version = GJ_FORMAT_VERSION;
		this.createdOn = Date.now();
		this.context = context;
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
		obj.createdOn = jsonObj.createdOn;

		if (Array.isArray(jsonObj.hydration)) {
			obj.hydration = jsonObj.hydration;
		} else {
			obj.hydration = [];
		}

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
}
