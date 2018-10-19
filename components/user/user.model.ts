import { Api } from '../api/api.service';
import { MediaItem } from '../media-item/media-item-model';
import { Model } from '../model/model.service';
import { Registry } from '../registry/registry.service';
import { Theme } from '../theme/theme.model';

export class User extends Model {
	static readonly TYPE_GAMER = 'User';
	static readonly TYPE_DEVELOPER = 'Developer';

	type!: 'User' | 'Developer';
	username!: string;
	name!: string;
	web_site!: string;
	display_name!: string;
	url!: string;
	slug!: string;
	img_avatar!: string;
	dogtag!: string;

	status!: number;
	permission_level!: number;
	is_verified!: boolean;
	is_partner!: boolean | null;

	created_on!: number;
	last_logged_on!: number;

	twitter_id?: string;
	twitter_screenname?: string;

	twitch_id?: string;
	twitch_name?: string;

	google_id?: string;
	google_nickname?: string;

	theme!: Theme | null;
	follower_count!: number;
	following_count!: number;
	is_following?: boolean;

	// Manage linked accounts settings - fb is only returned in the profile pages
	facebook_id?: string;
	facebook_name?: string;

	// exp settings.
	level?: number;
	experience?: number;
	experience_next?: number;
	level_next_percentage?: number;

	// Profile settings.
	avatar_media_item?: MediaItem;
	header_media_item?: MediaItem;
	disable_gravatar?: boolean;

	description?: string;
	description_compiled?: string;
	description_markdown?: string;
	has_compiled_description?: boolean;

	// Notifications settings.
	newsletter?: boolean;
	notifiy_shouts?: boolean;
	notifiy_comments?: boolean;
	notifiy_comment_replies?: boolean;
	notifiy_ratings?: boolean;
	notifiy_game_follows?: boolean;
	notifiy_user_follows?: boolean;
	notifiy_user_uploads?: boolean;
	notifiy_private_messages?: boolean;
	notifiy_friendships?: boolean;
	notifiy_forum_posts?: boolean;
	notifiy_followed_game_updates?: boolean;
	notifiy_sales?: boolean;
	notifiy_collaborator_invites?: boolean;
	notifiy_mentions?: boolean;
	notifiy_gj_news?: boolean;
	notifiy_gj_recommendations?: boolean;

	// Email settings
	email_address?: string;

	// Financials
	paypal_id?: string;
	paypal_email_address?: string;
	revenue_percentage?: number;
	revenue_payout_minimum?: number;
	revenue_wallet_maximum?: number;

	// Fireside.
	can_manage?: boolean;
	fireside_ga_tracking_id?: string;

	// Fireside profile
	fireside_profile?: string;
	compiled_fireside_profile?: string;
	fireside_about?: string;
	compiled_fireside_about?: string;

	// Card
	post_count?: number;
	game_count?: number;
	video_count?: number;

	is_gamer = false;
	is_developer = false;

	get isMod() {
		return this.permission_level >= 3;
	}

	constructor(data: any = {}) {
		super(data);

		if (this.type === User.TYPE_GAMER) {
			this.is_gamer = true;
		} else if (this.type === User.TYPE_DEVELOPER) {
			this.is_developer = true;
		}

		if (data.avatar_media_item) {
			this.avatar_media_item = new MediaItem(data.avatar_media_item);
		}

		if (data.header_media_item) {
			this.header_media_item = new MediaItem(data.header_media_item);
		}

		if (data.theme) {
			this.theme = new Theme(data.theme);
		}

		Registry.store('User', this);
	}

	static touch() {
		if (GJ_IS_SSR) {
			return Promise.resolve();
		}

		// We don't want to wait for the touch in Client since we know it gets loaded in
		// immediately.
		if (GJ_IS_CLIENT) {
			Api.sendRequest('/web/touch', null, { detach: true });
			return Promise.resolve();
		}

		return Api.sendRequest('/web/touch');
	}

	async $follow() {
		const response = await Api.sendRequest(
			'/web/profile/follow/' + this.id,
			{},
			{ detach: true }
		);

		this.is_following = true;
		++this.follower_count;

		return response;
	}

	async $unfollow() {
		const response = await Api.sendRequest(
			'/web/profile/unfollow/' + this.id,
			{},
			{ detach: true }
		);

		this.is_following = false;
		--this.follower_count;

		return response;
	}

	$save() {
		// You can only save yourself, so we don't pass in an ID to the endpoint.
		return this.$_save('/web/dash/profile/save', 'user', {
			allowComplexData: ['theme'],
		});
	}

	$saveAvatar() {
		// You can only save yourself, so we don't pass in an ID to the endpoint.
		return this.$_save('/web/dash/avatar/save', 'user', {
			file: this.file,
			allowComplexData: ['crop'],
		});
	}

	$clearAvatar() {
		return this.$_save('/web/dash/avatar/clear', 'user');
	}

	$saveHeader() {
		// You can only save yourself, so we don't pass in an ID to the endpoint.
		return this.$_save('/web/dash/header/save', 'user', {
			file: this.file,
			allowComplexData: ['crop'],
		});
	}

	$clearHeader() {
		return this.$_save('/web/dash/header/clear', 'user');
	}

	$saveEmailPreferences() {
		// You can only save yourself, so we don't pass in an ID to the endpoint.
		return this.$_save('/web/dash/email-preferences/save', 'user');
	}

	$toggleEmails(state: boolean) {
		return this.$_save('/web/dash/email-preferences/toggle-emails', 'user', {
			data: { state },
		});
	}

	$unlinkAccount(provider: string) {
		return this.$_save('/web/dash/linked-accounts/unlink/' + provider, 'user');
	}
}

Model.create(User);
