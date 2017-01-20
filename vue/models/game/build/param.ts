import { Model } from '../../../services/model/model';

export class GameBuildParam extends Model
{
	game_build_id: number;
	name: string;
	value: string;
}
