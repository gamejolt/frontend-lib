import { Injectable, Inject } from '@angular/core';
import sortBy from 'lodash-es/sortBy';
import find from 'lodash-es/find';

import { makeModel, Model } from '../model/model.service';
import { Api } from '../api/api.service';
import { App } from '../app/app.service';
import { Environment } from '../environment/environment.service';
import { User } from '../user/user.model';
import { MediaItem } from '../media-item/media-item.model';
import { GamePackage } from './package/package.model';

import { GameBuild } from './build/build.model';
// if ( $injector.has( 'Registry' ) ) {
// 	$injector.get( 'Registry' ).setConfig( 'Game', {
// 		maxItems: 100,
// 	} );
// }

const deps = {
	Api,
	App,
	Environment,
	User,
	MediaItem,
};

@Injectable()
export class Game extends Model
{
	static Api: Api;
	static App: App;
	static Environment: Environment;
	static User: typeof User;
	static MediaItem: typeof MediaItem;

	static readonly STATUS_HIDDEN = 0;
	static readonly STATUS_VISIBLE = 1;
	static readonly STATUS_REMOVED = 2;

	static readonly DEVELOPMENT_STATUS_FINISHED = 1;
	static readonly DEVELOPMENT_STATUS_WIP = 2;
	static readonly DEVELOPMENT_STATUS_CANCELED = 3;
	static readonly DEVELOPMENT_STATUS_DEVLOG = 4;

	developer: User;
	thumbnail_media_item: MediaItem;
	header_media_item: MediaItem;

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
	sellable: any;
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

	// These are computed in the constructor.
	_has_cover: boolean;
	is_published = false;
	_is_finished: boolean;
	_is_wip: boolean;
	_is_devlog: boolean;
	_has_packages = false;
	_should_show_ads = true;
	_can_buy_primary_sellable = false;

	constructor( data?: any )
	{
		super( data );

		if ( data.developer ) {
			this.developer = new Game.User( data.developer );
		}

		if ( data.thumbnail_media_item ) {
			this.thumbnail_media_item = new Game.MediaItem( data.thumbnail_media_item );
		}

		if ( data.header_media_item ) {
			this.header_media_item = new Game.MediaItem( data.header_media_item );
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
		if (
			this.sellable
			&& this.sellable.type !== 'free'
			&& Game.App.user
			&& this.developer
			&& Game.App.user.id === this.developer.id
		) {
			this.sellable.is_owned = true;
		}

		if ( this.sellable && this.sellable.type === 'paid' && !this.sellable.is_owned ) {
			this._can_buy_primary_sellable = true;
		}

		// if ( $injector.has( 'Registry' ) ) {
		// 	$injector.get( 'Registry' ).store( 'Game', this );
		// }
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

	static chooseBestBuild( builds: GameBuild[], os: string, arch: string | undefined )
	{
		const sortedBuilds = sortBy( builds, ( b ) =>
		{
			return b!._release!.sort;
		} );

		const build32 = find( sortedBuilds, {
			['os' + os]: true,
		} );

		const build64 = find( sortedBuilds, {
			['os' + os + '_64']: true,
		} );

		// If they are on 64bit, and we have a 64 bit build, we should try to
		// use it.
		if ( arch === '64' && build64 ) {

			// If the 64bit build is an older version than the 32bit build, then
			// we have to use 32bit anyway.
			if ( !build32 || build64!._release!.sort <= build32!._release!.sort ) {
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
		const response = await Game.Api.sendRequest( '/web/library/games/add/followed', { game_id: this.id } );

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
		return this.$_save(
			'/web/dash/developer/games/thumbnail/save/' + this.id,
			'game',
			{ file: this.file, allowComplexData: [ 'crop' ] },
		);
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

export const provideGame = makeModel( Game, deps );
