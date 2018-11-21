import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { MediaItem } from 'game-jolt-frontend-lib/components/media-item/media-item-model';
import { Model } from 'game-jolt-frontend-lib/components/model/model.service';
import { Theme } from 'game-jolt-frontend-lib/components/theme/theme.model';

export async function $joinCommunity(community: Community) {
	const response = await Api.sendRequest(
		'/web/communities/join/' + community.path,
		{},
		{ detach: true }
	);

	community.is_member = true;
	++community.member_count;

	return response;
}

export async function $leaveCommunity(community: Community) {
	const response = await Api.sendRequest(
		'/web/communities/leave/' + community.path,
		{},
		{ detach: true }
	);

	community.is_member = false;
	--community.member_count;

	return response;
}

export class Community extends Model {
	name!: string;
	path!: string;
	game_id?: number;
	header_id?: number;
	thumbnail_id?: number;

	header?: MediaItem;
	thumbnail?: MediaItem;
	theme!: Theme | null;
	member_count!: number;
	is_member?: boolean;

	is_unread = false;

	constructor(data: any = {}) {
		super(data);

		if (data.header) {
			this.header = new MediaItem(data.header);
		}

		if (data.thumbnail) {
			this.thumbnail = new MediaItem(data.thumbnail);
		}

		if (data.theme) {
			this.theme = new Theme(data.theme);
		}
	}
}

Model.create(Community);
