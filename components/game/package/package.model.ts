import { Injectable } from '@angular/core';
import keyBy from 'lodash-es/keyBy';
import filter from 'lodash-es/filter';

import { makeModel, Model } from '../../model/model.service';
import { Api } from '../../api/api.service';
import { App } from '../../app/app.service';
import { GameRelease } from '../release/release.model';
import { GameBuild } from '../build/build.model';
import { GameBuildLaunchOption } from '../build/launch-option/launch-option.model';
import { Game } from '../game.model';
import { Sellable } from '../../sellable/sellable.model';

@Injectable()
export class GamePackage extends Model
{
	static Api: Api;
	static App: App;
	static GameRelease: typeof GameRelease;
	static GameBuild: typeof GameBuild;
	static GameBuildLaunchOption: typeof GameBuildLaunchOption;
	static Sellable: typeof Sellable;

	static readonly STATUS_HIDDEN = 'hidden';
	static readonly STATUS_ACTIVE = 'active';
	static readonly STATUS_REMOVED = 'removed';

	static readonly VISIBILITY_PRIVATE = 'private';
	static readonly VISIBILITY_PUBLIC = 'public';

	game_id: number;
	sellable_id: number;
	title: string;
	description: string;
	sort: number;
	added_on: number;
	published_on: number;
	updated_on: number;
	visibility: string;
	status: string;
	is_game_owner: boolean;

	has_sales: boolean;
	has_browser_builds: boolean;
	is_in_paid_sellable: boolean;

	// These fields get added only during GamePackage.processPackagePayload.
	_releases?: GameRelease[];
	_builds?: GameBuild[];
	_sellable?: Sellable;

	constructor( data?: any )
	{
		super( data );
	}

	static $saveSort( gameId: number, packagesSort: any )
	{
		return GamePackage.Api.sendRequest( '/web/dash/developer/games/packages/save-sort/' + gameId, packagesSort );
	}

	static processPackagePayload( payload: any )
	{
		let packageData: {
			packages: GamePackage[],
			releases: GameRelease[],
			builds: GameBuild[],
			launchOptions: GameBuildLaunchOption[],
			sellables: Sellable[],
		} = {
			packages: payload.packages ? GamePackage.populate( payload.packages ) : [],
			releases: payload.releases ? GamePackage.GameRelease.populate( payload.releases ) : [],
			builds: payload.builds ? GamePackage.GameBuild.populate( payload.builds ) : [],
			launchOptions: payload.launchOptions ? GamePackage.GameBuildLaunchOption.populate( payload.launchOptions ) : [],
			sellables: payload.sellables ? GamePackage.Sellable.populate( payload.sellables ) : [],
		};

		const indexedPackages = keyBy( packageData.packages, 'id' );
		const indexedReleases = keyBy( packageData.releases, 'id' );
		const indexedSellables = keyBy( packageData.sellables, 'game_package_id' );

		for ( let _package of packageData.packages ) {
			_package._releases = filter( packageData.releases, { game_package_id: _package.id } );
			_package._builds = filter( packageData.builds, { game_package_id: _package.id } );
			_package._sellable = indexedSellables[ _package.id ];

			// If this is the developer of the game, then spoof that they own the game/package.
			if ( _package.is_game_owner && _package._sellable ) {
				_package._sellable.is_owned = true;
			}
		}

		for ( let release of packageData.releases ) {
			release._package = indexedPackages[ release.game_package_id ];
			release._builds = filter( release._package._builds || [], { game_release_id: release.id } );
		}

		for ( let build of packageData.builds ) {
			build._package = indexedPackages[ build.game_package_id ];
			build._release = indexedReleases[ build.game_release_id ];
			build._launch_options = filter( packageData.launchOptions, { game_build_id: build.id } );
		}

		return packageData;
	}

	shouldShowNamePrice()
	{
		return this._sellable
			&& this._sellable.type === 'pwyw'
			&& !this._sellable.is_owned;
	};

	$save()
	{
		if ( !this.id ) {
			return this.$_save( '/web/dash/developer/games/packages/save/' + this.game_id, 'gamePackage' );
		}
		else {
			return this.$_save( '/web/dash/developer/games/packages/save/' + this.game_id + '/' + this.id, 'gamePackage' );
		}
	};

	async $remove( game: Game )
	{
		const response = await this.$_remove( '/web/dash/developer/games/packages/remove/' + this.game_id + '/' + this.id );

		if ( game && response.game ) {
			game.assign( response.game );
		}

		return response;
	};
}

const deps = { Api, App, GameRelease, GameBuild, GameBuildLaunchOption, Sellable };
export const provideGamePackage = makeModel( GamePackage, deps );
