import { Model } from '../model/model.service';
import { Registry } from '../registry/registry.service';
import { arrayRemove } from '../../utils/array';

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
		this.encounters.push(monster);
	}

	static remove(monster: HalloweenMonster) {
		arrayRemove(HalloweenMonster.encounters, item => item.id === monster.id);
	}
}

Model.create(HalloweenMonster);
