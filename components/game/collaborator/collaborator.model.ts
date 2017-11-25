import { Model } from '../../model/model.service';
import { User } from '../../user/user.model';
import { Game } from '../game.model';
import { Api } from '../../api/api.service';

export type Perm =
	| 'all'
	| 'analytics'
	| 'sales'
	| 'details'
	| 'media'
	| 'devlogs'
	| 'comments'
	| 'ratings'
	| 'builds'
	| 'game-api';

export type GameCollaboratorRole = 'owner' | 'collaborator' | 'community-manager' | 'developer';

export class GameCollaborator extends Model {
	static readonly STATUS_ACTIVE = 'active';
	static readonly STATUS_INVITE = 'invite';

	static readonly ROLE_OWNER = 'owner';
	static readonly ROLE_COLLABORATOR = 'collaborator';
	static readonly ROLE_COMMUNITY_MANAGER = 'community-manager';
	static readonly ROLE_DEVELOPER = 'developer';

	game_id: number;
	user_id: number;
	status: typeof GameCollaborator.STATUS_ACTIVE | typeof GameCollaborator.STATUS_INVITE;
	username: string; // for submitting
	role: GameCollaboratorRole;
	perms: Perm[];
	added_on: number;
	accepted_on: number;

	game?: Game;
	user?: User;

	constructor(data: any = {}) {
		super(data);

		if (data.game) {
			this.game = new Game(data.game);
		}

		if (data.user) {
			this.user = new User(data.user);
		}
	}

	$invite() {
		return this.$_save(
			'/web/dash/developer/games/collaborators/invite/' + this.game_id,
			'collaborator'
		);
	}

	$accept() {
		return this.$_save(
			'/web/dash/developer/games/collaborators/accept/' + this.game_id,
			'collaborator'
		);
	}

	async $remove() {
		const response = await Api.sendRequest(
			'/web/dash/developer/games/collaborators/remove/' + this.game_id,
			{
				user_id: this.user_id,
				role: this.role,
			}
		);
		return this.processRemove(response);
	}
}

Model.create(GameCollaborator);
