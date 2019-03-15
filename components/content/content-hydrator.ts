import { arrayRemove } from '../../utils/array';
import { Api } from '../api/api.service';

export type ContentHydrationType = 'media-item-id' | 'game-id' | 'username' | 'community-path';

export type ContentHydrationDataEntry = {
	type: ContentHydrationType;
	id: string;
	data: any;
};

export class ContentHydrator {
	public hydration: ContentHydrationDataEntry[];

	constructor(hydration: ContentHydrationDataEntry[] = []) {
		this.hydration = hydration;
	}

	async getData(type: ContentHydrationType, id: string) {
		// Try to find hydration in existing pool
		// If it's dry, request hydration from the server

		const existingEntry = this.hydration.find(i => i.type === type && i.id === id);
		if (existingEntry) {
			return existingEntry.data;
		}

		const result = await Api.sendRequest(`/web/content/hydrate/${type}/${id}`);
		const entry = {
			type,
			id,
			data: result.data,
		} as ContentHydrationDataEntry;
		this.hydration.push(entry);

		return entry.data;
	}

	dry(type: ContentHydrationType, id: string) {
		arrayRemove(this.hydration, i => i.type === type && i.id === id);
	}
}
