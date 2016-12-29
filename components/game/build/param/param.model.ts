import { Injectable } from '@angular/core';
import { makeModel, Model } from '../../../model/model.service';

@Injectable()
export class GameBuildParam extends Model
{
	game_build_id: number;
	name: string;
	value: string;

	constructor( data?: any )
	{
		super( data );
	}
}

const deps = {};
export const provideGameBuildParam = makeModel( GameBuildParam, deps );
