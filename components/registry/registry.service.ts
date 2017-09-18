type RegistryIdType = string | number;

export interface RegistryModel {
	registryId: RegistryIdType;
}

export class RegistryItemConfig {
	constructor(public maxItems = 0) {}
}

export class Registry {
	static config: { [k: string]: RegistryItemConfig } = {};
	static items: { [k: string]: RegistryModel[] } = {};

	static setConfig(type: string, config: RegistryItemConfig) {
		this.config[type] = config;
	}

	static store(type: string, newItems: RegistryModel[] | RegistryModel) {
		if (typeof this.config[type] === 'undefined') {
			this.config[type] = new RegistryItemConfig();
		}

		if (!this.config[type].maxItems) {
			return;
		}

		if (typeof this.items[type] === 'undefined') {
			this.items[type] = [];
		}

		if (!Array.isArray(newItems)) {
			newItems = [newItems];
		}

		// We remove new items from the current array so that they put at the
		// end and don't get cleaned out.
		const toRemove = [];
		for (const item of newItems) {
			for (let i = 0; i < this.items[type].length; ++i) {
				if (this.items[type][i].registryId === item.registryId) {
					toRemove.push(i);
					break;
				}
			}
		}

		if (toRemove.length) {
			for (const index of toRemove) {
				this.items[type].splice(index, 1);
			}
		}

		this.items[type] = this.items[type].concat(newItems);
		this.items[type] = this.items[type].slice(-this.config[type].maxItems);
	}

	static find<T>(type: string, id: RegistryIdType): T | null {
		if (typeof this.items[type] === 'undefined') {
			this.items[type] = [];
		}

		// if (field === 'id' && typeof id === 'string') {
		// 	id = parseInt(id, 10);
		// }

		for (const item of this.items[type]) {
			if (item.registryId === id) {
				return item as any;
			}
		}

		return null;
	}
}
