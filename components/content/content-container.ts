import { ContentContext } from 'game-jolt-frontend-lib/components/content/content-context';
import { ContentHydrationDataEntry } from 'game-jolt-frontend-lib/components/content/content-hydrator';
import { ContentObject } from 'game-jolt-frontend-lib/components/content/content-object';

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
		return JSON.parse(json) as ContentContainer;
	}
}
