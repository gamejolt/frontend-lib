import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { MediaItem } from 'game-jolt-frontend-lib/components/media-item/media-item-model';
import { Model } from 'game-jolt-frontend-lib/components/model/model.service';
import { Theme } from 'game-jolt-frontend-lib/components/theme/theme.model';

export type Perm = 'feature' | 'all';

export async function $joinCommunity(community: Community) {
	community.is_member = true;
	++community.member_count;

	try {
		const response = await Api.sendRequest(
			'/web/communities/join/' + community.path,
			{},
			{ detach: true }
		);

		return response;
	} catch (e) {
		community.is_member = false;
		--community.member_count;
		throw e;
	}
}

export async function $leaveCommunity(community: Community) {
	community.is_member = false;
	--community.member_count;

	try {
		const response = await Api.sendRequest(
			'/web/communities/leave/' + community.path,
			{},
			{ detach: true }
		);

		return response;
	} catch (e) {
		throw e;
	}
}

export class Community extends Model {
	name!: string;
	path!: string;
	header_id?: number;
	thumbnail_id?: number;

	header?: MediaItem;
	thumbnail?: MediaItem;
	theme!: Theme | null;
	member_count!: number;
	is_member?: boolean;

	perms?: Perm[];

	is_unread = false;
	unreadWatermark?: number = undefined;

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

	hasPerms(required?: Perm | Perm[], either?: boolean) {
		if (!this.perms) {
			return false;
		}

		if (!required || this.perms.indexOf('all') !== -1) {
			return true;
		}

		required = Array.isArray(required) ? required : [required];
		const missingPerms = required.filter(perm => this.perms!.indexOf(perm) === -1);
		if (either) {
			return missingPerms.length !== required.length;
		} else {
			return missingPerms.length === 0;
		}
	}
}

Model.create(Community);
