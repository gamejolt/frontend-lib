import { Injectable } from '@angular/core';
import { makeModel, Model } from '../../model/model.service';
import { Api } from '../../api/api.service';
import { Game } from '../game.model';
import { GameBuild } from '../build/build.model';
import { GamePackage } from '../package/package.model';

@Injectable()
export class GameRelease extends Model
{
	static Api: Api;

	static readonly STATUS_HIDDEN = 'hidden';
	static readonly STATUS_PUBLISHED = 'published';
	static readonly STATUS_REMOVED = 'removed';

	game_id: number;
	game_package_id: number;
	version_number: string;
	added_on: number;
	published_on: number;
	updated_on: number;
	status: string;
	sort: number;

	/**
	 * Not active build count. All non-removed builds (even if not available yet).
	 */
	build_count: number;

	// These fields get added only during GamePackage.processPackagePayload.
	_package?: GamePackage;
	_builds?: GameBuild[];

	constructor( data?: any )
	{
		super( data );
	}

	$save()
	{
		let params = [ this.game_id, this.game_package_id ];
		if ( !this.id ) {
			return this.$_save(
				'/web/dash/developer/games/releases/save/' + params.join( '/' ),
				'gameRelease',
			);
		}
		else {
			params.push( this.id );
			return this.$_save(
				'/web/dash/developer/games/releases/save/' + params.join( '/' ),
				'gameRelease',
			);
		}
	}

	async $publish( game: Game )
	{
		let params = [ this.game_id, this.game_package_id, this.id ];
		const response = await this.$_save(
			'/web/dash/developer/games/releases/publish/' + params.join( '/' ),
			'gameRelease',
		);

		if ( game && response.game ) {
			game.assign( response.game );
		}

		return response;
	}

	async $unpublish( game: Game )
	{
		let params = [ this.game_id, this.game_package_id, this.id ];
		const response = await this.$_save(
			'/web/dash/developer/games/releases/unpublish/' + params.join( '/' ),
			'gameRelease',
		);

		if ( game && response.game ) {
			game.assign( response.game );
		}

		return response;
	}

	async $remove( game: Game )
	{
		let params = [ this.game_id, this.game_package_id, this.id ];
		const response = await this.$_remove(
			'/web/dash/developer/games/releases/remove/' + params.join( '/' ),
		);

		if ( game && response.game ) {
			game.assign( response.game );
		}

		return response;
	}
}

const deps = { Api };
export const provideGameRelease = makeModel( GameRelease, deps );
