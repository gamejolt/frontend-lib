import { Model } from '../../../services/model/model';

export class GameBuildFile extends Model
{
	game_build_id: number;
	filename: string;
	filesize: string;
	java_include_archive: boolean;
	is_archive: boolean;
}
