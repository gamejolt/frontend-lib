import { Model } from '../../model/model.service';
import { GameBuild } from '../build/build.model';
import { GameBuildLaunchOption } from '../build/launch-option/launch-option.model';
import { Game } from '../game.model';
import { Api } from '../../api/api.service';
import { GameRelease } from '../release/release.model';
import { Sellable } from '../../sellable/sellable.model';

export class GamePackage extends Model
{
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

	// These fields get added only during processPackagePayload.
	_releases?: GameRelease[];
	_builds?: GameBuild[];
	_sellable?: Sellable;

	static $saveSort( gameId: number, packagesSort: any )
	{
		return Api.sendRequest( '/web/dash/developer/games/packages/save-sort/' + gameId, packagesSort );
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
			releases: payload.releases ? GameRelease.populate( payload.releases ) : [],
			builds: payload.builds ? GameBuild.populate( payload.builds ) : [],
			launchOptions: payload.launchOptions ? GameBuildLaunchOption.populate( payload.launchOptions ) : [],
			sellables: payload.sellables ? Sellable.populate( payload.sellables ) : [],
		};

		let indexedPackages: { [k: number]: GamePackage } = {};
		let indexedReleases: { [k: number]: GameRelease } = {};
		let indexedSellables: { [k: number]: Sellable } = {};

		packageData.packages.forEach( ( p ) => indexedPackages[ p.id ] = p );
		packageData.releases.forEach( ( r ) => indexedReleases[ r.id ] = r );
		packageData.sellables.forEach( ( s ) => indexedSellables[ s.game_package_id! ] = s );

		for ( let _package of packageData.packages ) {
			_package._releases = packageData.releases.filter( ( r ) => r.game_package_id === _package.id );
			_package._builds = packageData.builds.filter( ( b ) => b.game_package_id === _package.id );
			_package._sellable = indexedSellables[ _package.id ];

			// If this is the developer of the game, then spoof that they own the game/package.
			if ( _package.is_game_owner && _package._sellable ) {
				_package._sellable.is_owned = true;
			}
		}

		for ( let release of packageData.releases ) {
			release._package = indexedPackages[ release.game_package_id ];
			release._builds = (release._package!._builds || []).filter( ( b ) => b.game_release_id === release.id );
		}

		for ( let build of packageData.builds ) {
			build._package = indexedPackages[ build.game_package_id ];
			build._release = indexedReleases[ build.game_release_id ];
			build._launch_options = packageData.launchOptions.filter( ( l ) => l.game_build_id === build.id );
		}

		return packageData;
	}

	shouldShowNamePrice()
	{
		return this._sellable
			&& this._sellable.type === 'pwyw'
			&& !this._sellable.is_owned;
	}

	$save()
	{
		if ( !this.id ) {
			return this.$_save( '/web/dash/developer/games/packages/save/' + this.game_id, 'gamePackage' );
		}
		else {
			return this.$_save( '/web/dash/developer/games/packages/save/' + this.game_id + '/' + this.id, 'gamePackage' );
		}
	}

	async $remove( game: Game )
	{
		const response = await this.$_remove( '/web/dash/developer/games/packages/remove/' + this.game_id + '/' + this.id );

		if ( game && response.game ) {
			game.assign( response.game );
		}

		return response;
	}
}

Model.create( GamePackage );
