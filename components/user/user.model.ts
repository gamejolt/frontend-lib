import { Model } from '../model/model.service';
import { Api } from '../api/api.service';
import { Registry } from '../registry/registry.service';

export class User extends Model {
	static readonly TYPE_GAMER = 'User';
	static readonly TYPE_DEVELOPER = 'Developer';

	type: 'User' | 'Developer';
	username: string;
	name: string;
	web_site: string;
	display_name: string;
	url: string;
	slug: string;
	img_avatar: string;
	dogtag: string;

	status: number;
	permission_level: number;
	is_verified: boolean;
	is_partner: boolean;

	created_on: number;
	last_logged_on: number;

	twitter_id?: string;
	twitter_screenname?: string;

	facebook_id?: string;
	facebook_name?: string;

	twitch_id?: string;
	twitch_name?: string;

	google_id?: string;
	google_nickname?: string;

	is_gamer = false;
	is_developer = false;

	level_next_percentage: number;

	follower_count: number;
	is_following: boolean;

	// Fireside.
	can_manage: boolean;
	fireside_ga_tracking_id: string;
	fireside_profile: string;
	compiled_fireside_profile: string;
	fireside_about: string;
	compiled_fireside_about: string;

	// Financials
	paypal_id?: string;
	paypal_email_address?: string;
	revenue_percentage?: number;
	revenue_payout_minimum?: number;
	revenue_wallet_maximum?: number;

	constructor(data: any = {}) {
		super(data);

		if (this.type === User.TYPE_GAMER) {
			this.is_gamer = true;
		} else if (this.type === User.TYPE_DEVELOPER) {
			this.is_developer = true;
		}

		Registry.store('User', this);
	}

	static touch() {
		if (GJ_IS_SSR) {
			return Promise.resolve();
		}
		return Api.sendRequest('/web/touch');
	}

	async $follow() {
		const response = await Api.sendRequest('/web/profile/follow/' + this.id, {}, { detach: true });

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
		return this.$_save('/web/dash/profile/save', 'user');
	}

	$saveEmailPreferences() {
		// You can only save yourself, so we don't pass in an ID to the endpoint.
		return this.$_save('/web/dash/email-preferences/save', 'user');
	}

	$saveFireside() {
		return this.$_save('/fireside/dash/profile/save', 'user');
	}

	$saveFiresideSettings() {
		return this.$_save('/fireside/dash/settings/save', 'user');
	}

	$unlinkAccount(provider: string) {
		return this.$_save('/web/dash/linked-accounts/unlink/' + provider, 'user');
	}
}

Model.create(User);
