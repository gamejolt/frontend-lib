import { arrayRemove } from '../../utils/array';
import { Api } from '../api/api.service';

/**
 * The type of source passed into the hydrator, not what the resulting hydration data will be.
 */
export type ContentHydrationType =
	| 'media-item-id'
	| 'game-id'
	| 'username'
	| 'community-path'
	| 'soundcloud-track-url'
	| 'soundcloud-track-id';

export type ContentHydrationDataEntry = {
	type: ContentHydrationType;
	source: string;
	data: any;
};

export class ContentHydrator {
	public hydration: ContentHydrationDataEntry[];

	constructor(hydration: ContentHydrationDataEntry[] = []) {
		this.hydration = [];
		for (const entry of hydration) {
			if (entry.data) {
				this.hydration.push(entry);
			}
		}
	}

	async getData(type: ContentHydrationType, source: string) {
		// Try to find hydration in existing pool
		// If it's dry, request hydration from the server

		const existingEntry = this.hydration.find(i => i.type === type && i.source === source);
		if (existingEntry) {
			return existingEntry.data;
		}

		const encodedId = encodeURIComponent(source);
		const result = await Api.sendRequest(`/web/content/hydrate/${type}/${encodedId}`);
		const entry = {
			type,
			source,
			data: result.data,
		} as ContentHydrationDataEntry;
		this.hydration.push(entry);

		return entry.data;
	}

	dry(type: ContentHydrationType, id: string) {
		arrayRemove(this.hydration, i => i.type === type && i.source === id);
	}
}
