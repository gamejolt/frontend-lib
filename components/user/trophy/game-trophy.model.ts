import { arrayIndexBy } from '../../../utils/array';
import { Game } from '../../game/game.model';
import { GameTrophy } from '../../game/trophy/trophy.model';
import { Model } from '../../model/model.service';
import { User } from '../user.model';
import { UserBaseTrophy } from './user-base-trophy.model';

export class UserGameTrophy extends UserBaseTrophy {
	game_id!: number;
	game_trophy_id!: number;

	game_trophy?: GameTrophy;
	user?: User;
	game?: Game;

	constructor(data: any = {}) {
		super(data);

		if (data.game_trophy) {
			this.game_trophy = new GameTrophy(data.game_trophy);
		}
		if (data.user) {
			this.user = new User(data.user);
		}
		if (data.game) {
			this.game = new Game(data.game);
		}
	}

	get trophy() {
		return this.game_trophy;
	}

	async $view() {
		this.$_save(`/web/profile/trophies/view-game/${this.id}`, 'userGameTrophy');
	}

	/**
	 * Indexes the achieved trophies by their trophy ID.
	 */
	static indexAchieved(trophies: UserGameTrophy[]) {
		return arrayIndexBy(trophies, 'game_trophy_id');
	}
}

Model.create(UserGameTrophy);
