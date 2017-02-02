import { Model } from '../model/model.service';
import { User } from '../user/user.model';
import { MediaItem } from '../media-item/media-item-model';
import { Api } from '../api/api.service';
import { GamePackage } from './package/package.model';
import { GameBuild } from './build/build.model';
import { Sellable } from '../sellable/sellable.model';
import { getProvider } from '../../utils/utils';
import { Registry } from '../registry/registry.service';

export class Game extends Model
{
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
	view_count: number;
	play_count: number;
	download_count: number;
	bundle_only: boolean;
	ga_tracking_id: string;
	ads_enabled: boolean;
	comments_enabled: boolean;

	description: string;
	description_markdown: string;
	description_compiled: string;
	has_compiled_description: boolean;

	has_active_builds: boolean;

	// These are computed in the constructor.
	_has_cover: boolean;
	is_published = false;
	_is_finished: boolean;
	_is_wip: boolean;
	_is_devlog: boolean;
	_has_packages = false;
	_should_show_ads = true;
	_can_buy_primary_sellable = false;

	file?: any;

	constructor( data: any = {} )
	{
		super( data );

		if ( data.developer ) {
			this.developer = new User( data.developer );
		}

		if ( data.thumbnail_media_item ) {
			this.thumbnail_media_item = new MediaItem( data.thumbnail_media_item );
		}

		if ( data.header_media_item ) {
			this.header_media_item = new MediaItem( data.header_media_item );
		}

		this._has_cover = !!this.header_media_item;

		if ( this.status === Game.STATUS_VISIBLE ) {
			this.is_published = true;
		}

		this._is_finished = this.development_status === Game.DEVELOPMENT_STATUS_FINISHED;
		this._is_wip = this.development_status === Game.DEVELOPMENT_STATUS_WIP;
		this._is_devlog = this.development_status === Game.DEVELOPMENT_STATUS_DEVLOG;

		if ( this.compatibility ) {
			const keys = Object.keys( this.compatibility );
			for ( let i = 0; i < keys.length; ++i ) {
				if ( keys[ i ] !== 'id' && keys[ i ] !== 'game_id' ) {
					this._has_packages = true;
					break;
				}
			}
		}

		// We don't want to show ads if this game has sellable items.
		if ( !this.ads_enabled ) {
			this._should_show_ads = false;
		}
		else if ( this.sellable && this.sellable.type !== 'free' ) {
			this._should_show_ads = false;
		}

		// Should show as owned for the dev of the game.
		if ( this.sellable && this.sellable.type !== 'free' && this.developer ) {

			// TODO: Get this working for Vue.
			if ( GJ_IS_ANGULAR ) {
				const App = getProvider<any>( 'App' );
				if ( App.user && App.user.id === this.developer.id ) {
					this.sellable.is_owned = true;
				}
			}
		}

		if ( this.sellable && this.sellable.type === 'paid' && !this.sellable.is_owned ) {
			this._can_buy_primary_sellable = true;
		}

		Registry.store( 'Game', this );
	}

	getSref( page: string, includeParams = false )
	{
		let sref = '';

		if ( page === 'dashboard' ) {
			sref = 'dashboard.developer.games.manage.game.overview';
		}
		else if ( page === 'edit' ) {
			sref = 'dashboard.developer.games.manage.game.details';
		}
		else {
			sref = 'discover.games.view.overview';
		}

		if ( includeParams ) {
			sref += '( ' + JSON.stringify( this.getSrefParams( page ) ) + ' )';
		}

		return sref;
	}

	getSrefParams( page: string )
	{
		if ( [ 'dashboard', 'edit' ].indexOf( page ) !== -1 ) {
			return { id: this.id };
		}

		return {
			id: this.id,
			category: this.category_slug,
			slug: this.slug
		};
	}

	getUrl( page: string )
	{
		if ( page === 'soundtrack' ) {
			return '/games/' + this.slug + '/' + this.id + '/download/soundtrack';
		}

		return getProvider<any>( '$state' ).href(
			this.getSref( page ),
			this.getSrefParams( page )
		);
	}

	hasDesktopSupport(): boolean
	{
		const compat = this.compatibility;
		return compat.os_windows
			|| compat.os_windows_64
			|| compat.os_mac
			|| compat.os_mac_64
			|| compat.os_linux
			|| compat.os_linux_64
			;
	}

	hasBrowserSupport(): boolean
	{
		const compat = this.compatibility;
		return compat.type_html
			|| compat.type_flash
			|| compat.type_unity
			|| compat.type_applet
			|| compat.type_silverlight
			;
	}

	/**
	 * Helper function to check if the resource passed in has support for the
	 * os/arch passed in.
	 */
	static checkDeviceSupport( obj: any, os: string, arch: string | undefined ): boolean
	{
		if ( obj[ 'os_' + os ] ) {
			return true;
		}

		// If they are on 64bit, then we can check for 64bit only support as well.
		// If there is no arch (web site context) then we allow 64bit builds as well.
		if ( (!arch || arch === '64') && obj[ 'os_' + os + '_64' ] ) {
			return true;
		}

		return false;
	}

	canInstall( os: string, arch: string | undefined ): boolean
	{
		// Obviously can't install if no desktop build.
		if ( !this.hasDesktopSupport() ) {
			return false;
		}

		return Game.checkDeviceSupport( this.compatibility, os, arch );
	}

	static pluckInstallableBuilds( packages: GamePackage[], os: string, arch: string | undefined ): GameBuild[]
	{
		let pluckedBuilds: GameBuild[] = [];

		packages.forEach( ( _package ) =>
		{
			// Don't include builds for packages that aren't bought yet.
			// Can't install them if they can't be bought.
			if (
				_package._sellable
				&& _package._sellable.type === 'paid'
				&& !_package._sellable.is_owned
			) {
				return;
			}

			if ( _package._builds ) {
				_package._builds.forEach( ( build ) =>
				{
					if ( Game.checkDeviceSupport( build, os, arch ) ) {
						pluckedBuilds.push( build );
					}
				} );
			}
		} );

		return pluckedBuilds;
	};

	static pluckBrowserBuilds( packages: GamePackage[] )
	{
		let pluckedBuilds: GameBuild[] = [];

		packages.forEach( ( _package: GamePackage ) =>
		{
			if ( !_package._builds ) {
				return;
			}

			_package._builds.forEach( ( build ) =>
			{
				if ( build.isBrowserBased() ) {
					pluckedBuilds.push( build );
				}
			} );
		} );

		return pluckedBuilds;
	};

	static pluckRomBuilds( packages: GamePackage[] )
	{
		let pluckedBuilds: GameBuild[] = [];

		packages.forEach( ( _package ) =>
		{
			if ( !_package._builds ) {
				return;
			}

			_package._builds.forEach( ( build ) =>
			{
				if ( build.isRom() ) {
					pluckedBuilds.push( build );
				}
			} );
		} );

		return pluckedBuilds;
	};

	static chooseBestBuild( builds: GameBuild[], os: string, arch?: string )
	{
		const sortedBuilds = builds.sort( ( a, b ) => a._release!.sort - b._release!.sort );

		const build32 = sortedBuilds.find( ( build ) => build.isPlatform( os ) );
		const build64 = sortedBuilds.find( ( build ) => build.isPlatform( os, '64' ) );

		// If they are on 64bit, and we have a 64 bit build, we should try to
		// use it.
		if ( arch === '64' && build64 ) {

			// If the 64bit build is an older version than the 32bit build, then
			// we have to use 32bit anyway.
			if ( !build32 || build64._release!.sort <= build32._release!.sort ) {
				return build64;
			}
		}

		if ( build32 ) {
			return build32;
		}

		return builds[0];
	}

	async $follow()
	{
		const response = await Api.sendRequest( '/web/library/games/add/followed', { game_id: this.id } );

		this.is_following = true;
		++this.follower_count;

		return response;
	}

	async $unfollow()
	{
		const response = await this.$_remove( '/web/library/games/remove/followed/' + this.id );

		this.is_following = false;
		--this.follower_count;

		return response;
	}

	$save()
	{
		if ( this.id ) {
			return this.$_save( '/web/dash/developer/games/save/' + this.id, 'game' );
		}
		else {
			return this.$_save( '/web/dash/developer/games/save', 'game' );
		}
	}

	$saveDescription()
	{
		return this.$_save( '/web/dash/developer/games/description/save/' + this.id, 'game' );
	}

	$saveMaturity()
	{
		return this.$_save( '/web/dash/developer/games/maturity/save/' + this.id, 'game' );
	}

	$saveThumbnail()
	{
		return this.$_save( '/web/dash/developer/games/thumbnail/save/' + this.id, 'game', { file: this.file, allowComplexData: [ 'crop' ] } );
	}

	$saveHeader()
	{
		return this.$_save( '/web/dash/developer/games/header/save/' + this.id, 'game', { file: this.file } );
	}

	$clearHeader()
	{
		return this.$_save( '/web/dash/developer/games/header/clear/' + this.id, 'game' );
	}

	$saveSettings()
	{
		return this.$_save( '/web/dash/developer/games/settings/save/' + this.id, 'game' );
	}

	$setStatus( status: number )
	{
		return this.$_save( '/web/dash/developer/games/set-status/' + this.id + '/' + status, 'game' );
	}

	$setDevStage( stage: number )
	{
		return this.$_save( '/web/dash/developer/games/set-dev-stage/' + this.id + '/' + stage, 'game' );
	}

	$setCanceled( isCanceled: boolean )
	{
		return this.$_save( '/web/dash/developer/games/set-canceled/' + this.id + '/' + (isCanceled ? '1' : '0'), 'game' );
	}

	$remove()
	{
		return this.$_remove( '/web/dash/developer/games/remove/' + this.id );
	}
}

Model.create( Game );
