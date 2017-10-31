import { Model } from '../model/model.service';
import { Registry } from '../registry/registry.service';
import { arrayRemove } from '../../utils/array';
import { Api } from '../api/api.service';
import { Screen } from '../screen/screen-service';

export type HalloweenMonsterType = 'pumpkin' | 'candy' | 'zombie' | 'witch' | 'vampire';

export class HalloweenMonster extends Model {
	static encounters: HalloweenMonster[] = [];

	user_level: number;
	seed: string;
	type: HalloweenMonsterType;

	constructor(data: any = {}) {
		super(data);

		Registry.store('HalloweenMonster', this);
	}

	static add(monster: HalloweenMonster) {
		if (Screen.isDesktop) {
			this.encounters.push(monster);
		}
	}

	static remove(monster: HalloweenMonster) {
		arrayRemove(HalloweenMonster.encounters, item => item.id === monster.id);
	}

	async $capture() {
		const result = await Api.sendRequest('/web/halloween-2017/capture/' + this.id, null, {
			detach: true,
			processPayload: false,
		});

		console.log(result);
		if (!result || !result.data || !result.data.payload || !result.data.payload.success) {
			throw new Error('Failed to capture');
		}

		return result.data.payload;
	}
}

Model.create(HalloweenMonster);
