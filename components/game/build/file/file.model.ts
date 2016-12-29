import { Injectable } from '@angular/core';
import { makeModel, Model } from '../../../model/model.service';

@Injectable()
export class GameBuildFile extends Model
{
	game_build_id: number;
	filename: string;
	filesize: string;
	java_include_archive: boolean;
	is_archive: boolean;

	constructor( data?: any )
	{
		super( data );
	}
}

const deps = {};
export const provideGameBuildFile = makeModel( GameBuildFile, deps );
