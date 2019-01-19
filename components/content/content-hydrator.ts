import { GJHydrationDataEntry } from 'game-jolt-frontend-lib/components/content/adapter/definitions';
import { Api } from '../api/api.service';

export class ContentHydrator {
	public hydration: GJHydrationDataEntry[];

	constructor(hydration: GJHydrationDataEntry[] = []) {
		this.hydration = hydration;
	}

	async getData(type: string, id: string) {
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
		} as GJHydrationDataEntry;
		this.hydration.push(entry);

		return entry.data;
	}
}
