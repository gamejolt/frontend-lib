import { Model } from '../../services/model/model';
import { GamePackage } from './package';
import { GameBuild } from './build';

export class GameRelease extends Model
{
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
}
