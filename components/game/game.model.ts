import { Model } from '../model/model.service';
import { User } from '../user/user.model';
import { MediaItem } from '../media-item/media-item-model';
import { Api } from '../api/api.service';
import { GamePackage } from './package/package.model';
import { GameBuild } from './build/build.model';
import { Sellable } from '../sellable/sellable.model';
import { Registry } from '../registry/registry.service';
import { Site } from '../site/site-model';
import { GameCollaborator } from './collaborator/collaborator.model';

export interface CustomMessage {
	type: 'info' | 'alert';
	message: string;
	class: string;
}

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

function pluckBuilds(packages: GamePackage[], func: (build: GameBuild) => boolean) {
	let pluckedBuilds: GameBuild[] = [];

	packages.forEach((_package: GamePackage) => {
		if (!_package._builds) {
			return;
		}

		_package._builds.forEach(build => {
			if (func(build)) {
				pluckedBuilds.push(build);
			}
		});
	});

	return pluckedBuilds;
}

export class Game extends Model {
	static readonly STATUS_HIDDEN = 0;
	static readonly STATUS_VISIBLE = 1;
	static readonly STATUS_REMOVED = 2;

	static readonly DEVELOPMENT_STATUS_FINISHED = 1;
	static readonly DEVELOPMENT_STATUS_WIP = 2;
	static readonly DEVELOPMENT_STATUS_CANCELED = 3;
	static readonly DEVELOPMENT_STATUS_DEVLOG = 4;

	developer: User;
	thumbnail_media_item?: MediaItem;
	header_media_item?: MediaItem;

	title: string;
	slug: string;
	path: string;
	img_thumbnail: string;
	has_animated_thumbnail: boolean;
	img_thumbnail_webm: string;
	img_thumbnail_mp4: string;
	media_count: number;
	follower_count: number;
	ratings_enabled: boolean;
	referrals_enabled: boolean;
	compatibility: any;
	modified_on: number;
	posted_on: number;
	published_on: number;
	status: number;
	development_status: number;
	canceled: boolean;
	tigrs_age: number;
	sellable: Sellable;
	can_user_rate: boolean;
	is_following: boolean;
	category: string;
	category_human: string;
	creation_tool: string;
	creation_tool_other: string;
	creation_tool_human: string;
	category_slug: string;
	web_site: string;
	bundle_only: boolean;
	ga_tracking_id: string;
	should_show_ads: boolean;
	ads_enabled: boolean;
	comments_enabled: boolean;

	description: string;
	description_markdown: string;
	description_compiled: string;
	has_compiled_description: boolean;

	has_active_builds: boolean;

	avg_rating: number;
	rating_count: number;

	sites_enabled: boolean;
	site?: Site;

	tigrs_cartoon_violence: number;
	tigrs_fantasy_violence: number;
	tigrs_realistic_violence: number;
	tigrs_bloodshed: number;
	tigrs_sexual_violence: number;
	tigrs_alcohol: number;
	tigrs_drugs: number;
	tigrs_tobacco: number;
	tigrs_nudity: number;
	tigrs_sexual_themes: number;
	tigrs_language: number;
	tigrs_humor: number;
	tigrs_gambling: number;

	// collaborator perms
	perms?: Perm[];

	constructor(data: any = {}) {
		super(data);

		if (data.developer) {
			this.developer = new User(data.developer);
		}

		if (data.thumbnail_media_item) {
			this.thumbnail_media_item = new MediaItem(data.thumbnail_media_item);
		}

		if (data.header_media_item) {
			this.header_media_item = new MediaItem(data.header_media_item);
		}

		if (data.site) {
			this.site = new Site(data.site);
		}

		// Should show as owned for the dev and collaborators of the game.
		if (this.sellable && this.sellable.type !== 'free' && this.hasPerms()) {
			this.sellable.is_owned = true;
		}

		Registry.store('Game', this);
	}

	get is_paid_game() {
		return this.sellable && this.sellable.type === 'paid';
	}

	get _can_buy_primary_sellable() {
		return this.is_paid_game && !this.sellable.is_owned;
	}

	// We don't want to show ads if this game has sellable items.
	get _should_show_ads() {
		return this.should_show_ads && (!this.sellable || this.sellable.type === 'free');
	}

	get _is_finished() {
		return this.development_status === Game.DEVELOPMENT_STATUS_FINISHED;
	}

	get _is_wip() {
		return this.development_status === Game.DEVELOPMENT_STATUS_WIP;
	}

	get _is_devlog() {
		return this.development_status === Game.DEVELOPMENT_STATUS_DEVLOG;
	}

	get is_published() {
		return this.status === Game.STATUS_VISIBLE;
	}

	get _has_cover() {
		return !!this.header_media_item;
	}

	get _has_packages() {
		if (this.compatibility) {
			const keys = Object.keys(this.compatibility);
			for (let i = 0; i < keys.length; ++i) {
				if (keys[i] !== 'id' && keys[i] !== 'game_id') {
					return true;
				}
			}
		}
		return false;
	}

	get routeLocation() {
		return {
			name: 'discover.games.view.overview',
			params: this.getSrefParams(),
		};
	}

	getSref(page = '', includeParams = false) {
		let sref = '';

		if (page === 'dashboard') {
			sref = 'dash.games.manage.game.overview';
		} else if (page === 'edit') {
			sref = 'dash.games.manage.game.details';
		} else {
			sref = 'discover.games.view.overview';
		}

		if (includeParams) {
			sref += '( ' + JSON.stringify(this.getSrefParams(page)) + ' )';
		}

		return sref;
	}

	getSrefParams(page = '') {
		if (['dashboard', 'edit'].indexOf(page) !== -1) {
			return { id: this.id };
		}

		return {
			id: this.id,
			category: this.category_slug,
			slug: this.slug,
		};
	}

	getUrl(page = '') {
		if (page === 'soundtrack') {
			return '/games/' + this.slug + '/' + this.id + '/download/soundtrack';
		}
		return '/games/' + this.slug + '/' + this.id;
	}

	hasDesktopSupport(): boolean {
		const compat = this.compatibility;
		return (
			compat.os_windows ||
			compat.os_windows_64 ||
			compat.os_mac ||
			compat.os_mac_64 ||
			compat.os_linux ||
			compat.os_linux_64
		);
	}

	hasBrowserSupport(): boolean {
		const compat = this.compatibility;
		return (
			compat.type_html ||
			compat.type_flash ||
			compat.type_unity ||
			compat.type_applet ||
			compat.type_silverlight
		);
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

	/**
	 * Helper function to check if the resource passed in has support for the
	 * os/arch passed in.
	 */
	static checkDeviceSupport(obj: any, os: string, arch: string | undefined): boolean {
		if (obj['os_' + os]) {
			return true;
		}

		// If they are on 64bit, then we can check for 64bit only support as well.
		// If there is no arch (web site context) then we allow 64bit builds as well.
		if ((!arch || arch === '64') && obj['os_' + os + '_64']) {
			return true;
		}

		return false;
	}

	canInstall(os: string, arch: string | undefined): boolean {
		// Obviously can't install if no desktop build.
		if (!this.hasDesktopSupport()) {
			return false;
		}

		return Game.checkDeviceSupport(this.compatibility, os, arch);
	}

	static pluckInstallableBuilds(
		packages: GamePackage[],
		os: string,
		arch: string | undefined
	): GameBuild[] {
		let pluckedBuilds: GameBuild[] = [];

		packages.forEach(_package => {
			// Don't include builds for packages that aren't bought yet.
			// Can't install them if they can't be bought.
			if (
				_package._sellable &&
				_package._sellable.type === 'paid' &&
				!_package._sellable.is_owned
			) {
				return;
			}

			if (_package._builds) {
				_package._builds.forEach(build => {
					if (Game.checkDeviceSupport(build, os, arch)) {
						pluckedBuilds.push(build);
					}
				});
			}
		});

		return pluckedBuilds;
	}

	static pluckDownloadableBuilds(packages: GamePackage[]) {
		return pluckBuilds(packages, i => i.isDownloadable);
	}

	static pluckBrowserBuilds(packages: GamePackage[]) {
		return pluckBuilds(packages, i => i.isBrowserBased);
	}

	static pluckRomBuilds(packages: GamePackage[]) {
		return pluckBuilds(packages, i => i.isRom);
	}

	static chooseBestBuild(builds: GameBuild[], os: string, arch?: string) {
		const sortedBuilds = builds.sort((a, b) => a._release!.sort - b._release!.sort);

		const build32 = sortedBuilds.find(build => build.isPlatform(os));
		const build64 = sortedBuilds.find(build => build.isPlatform(os, '64'));

		// If they are on 64bit, and we have a 64 bit build, we should try to
		// use it.
		if (arch === '64' && build64) {
			// If the 64bit build is an older version than the 32bit build, then
			// we have to use 32bit anyway.
			if (!build32 || build64._release!.sort <= build32._release!.sort) {
				return build64;
			}
		}

		if (build32) {
			return build32;
		}

		return builds[0];
	}

	async $follow() {
		const response = await Api.sendRequest('/web/library/games/add/followed', {
			game_id: this.id,
		});

		this.is_following = true;
		++this.follower_count;

		return response;
	}

	async $unfollow() {
		const response = await this.$_remove('/web/library/games/remove/followed/' + this.id);

		this.is_following = false;
		--this.follower_count;

		return response;
	}

	$save() {
		if (this.id) {
			return this.$_save('/web/dash/developer/games/save/' + this.id, 'game');
		} else {
			return this.$_save('/web/dash/developer/games/save', 'game');
		}
	}

	$saveDescription() {
		return this.$_save('/web/dash/developer/games/description/save/' + this.id, 'game');
	}

	$saveMaturity() {
		return this.$_save('/web/dash/developer/games/maturity/save/' + this.id, 'game');
	}

	$saveThumbnail() {
		return this.$_save('/web/dash/developer/games/thumbnail/save/' + this.id, 'game', {
			file: this.file,
			allowComplexData: ['crop'],
		});
	}

	$saveHeader() {
		return this.$_save('/web/dash/developer/games/header/save/' + this.id, 'game', {
			file: this.file,
		});
	}

	$clearHeader() {
		return this.$_save('/web/dash/developer/games/header/clear/' + this.id, 'game');
	}

	$saveSettings() {
		return this.$_save('/web/dash/developer/games/settings/save/' + this.id, 'game');
	}

	$setStatus(status: number) {
		return this.$_save('/web/dash/developer/games/set-status/' + this.id + '/' + status, 'game');
	}

	$setDevStage(stage: number) {
		return this.$_save('/web/dash/developer/games/set-dev-stage/' + this.id + '/' + stage, 'game');
	}

	$setCanceled(isCanceled: boolean) {
		return this.$_save(
			'/web/dash/developer/games/set-canceled/' + this.id + '/' + (isCanceled ? '1' : '0'),
			'game'
		);
	}

	async $inviteCollaborator(username: string, role: typeof GameCollaborator.prototype.role) {
		const response = await Api.sendRequest(
			'/web/dash/developer/games/collaborators/invite/' + this.id,
			{
				username,
				role,
			}
		);

		await GameCollaborator.processCreate(response, 'collaborator');
		return new GameCollaborator(response.collaborator);
	}

	$remove() {
		return this.$_remove('/web/dash/developer/games/remove/' + this.id);
	}
}

Model.create(Game);
