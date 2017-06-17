import { Model } from '../model/model.service';
import { GamePackage } from '../game/package/package.model';

export class KeyGroup extends Model {
	static readonly TYPE_ORDER = 'order';
	static readonly TYPE_ANONYMOUS = 'anonymous';
	static readonly TYPE_ANONYMOUS_CLAIM = 'anonymous-claim';
	static readonly TYPE_EMAIL = 'email';
	static readonly TYPE_USER = 'user';

	game_id: number;
	type: string;
	name: string;
	packages: GamePackage[] = [];
	key_count: number;
	viewed_count: number;
	claimed_count: number;

	constructor(data: any = {}) {
		super(data);

		if (data.packages) {
			this.packages = GamePackage.populate(data.packages);
		}
	}

	$save() {
		const options = {
			allowComplexData: ['packages'],
		};

		if (this.id) {
			return this.$_save(
				'/web/dash/developer/games/key-groups/save/' +
					this.game_id +
					'/' +
					this.id,
				'keyGroup',
				options
			);
		}

		return this.$_save(
			'/web/dash/developer/games/key-groups/save/' + this.game_id,
			'keyGroup',
			options
		);
	}

	$remove() {
		return this.$_remove(
			'/web/dash/developer/games/key-groups/remove/' +
				this.game_id +
				'/' +
				this.id
		);
	}
}

Model.create(KeyGroup);
