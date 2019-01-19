import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { MediaItem } from 'game-jolt-frontend-lib/components/media-item/media-item-model';
import { Model } from 'game-jolt-frontend-lib/components/model/model.service';
import { Theme } from 'game-jolt-frontend-lib/components/theme/theme.model';
import { Collaboratable } from '../collaborator/collaboratable';

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

export class Community extends Collaboratable(Model) {
	name!: string;
	path!: string;
	header_id?: number;
	thumbnail_id?: number;
	published_on!: number;
	is_hidden!: boolean;
	is_removed!: boolean;

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

	get is_published() {
		return this.published_on && !this.is_hidden && !this.is_removed;
	}

	getUrl(_page = '') {
		return `/c/${this.path}`;
	}

	$save() {
		if (this.id) {
			return this.$_save('/web/dash/communities/save/' + this.id, 'community');
		} else {
			return this.$_save('/web/dash/communities/save', 'community');
		}
	}

	$publish() {
		return this.$_save('/web/dash/communities/publish/' + this.id, 'community');
	}

	$saveThumbnail() {
		return this.$_save('/web/dash/communities/design/save-thumbnail/' + this.id, 'community', {
			file: this.file,
			allowComplexData: ['crop'],
		});
	}

	$saveHeader() {
		return this.$_save('/web/dash/communities/design/save-header/' + this.id, 'community', {
			file: this.file,
			allowComplexData: ['crop'],
		});
	}

	$saveDesign() {
		return this.$_save('/web/dash/communities/design/save/' + this.id, 'community', {
			allowComplexData: ['theme'],
		});
	}
}

Model.create(Community);
