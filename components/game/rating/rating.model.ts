import { Model } from '../../model/model.service';

export class GameRating extends Model {
	game_id!: number;
	rating!: number;
	posted_on!: number;
	type!: string;

	$save() {
		// This is an upsert.
		return this.$_save('/web/discover/games/ratings/save/' + this.game_id, 'gameRating', {
			ignoreLoadingBar: true,
		});
	}

	$remove() {
		// This is a clear.
		// Doesn't depend on the rating ID, only the game ID.
		return this.$_remove('/web/discover/games/ratings/clear/' + this.game_id, {
			ignoreLoadingBar: true,
		});
	}
}

Model.create(GameRating);
