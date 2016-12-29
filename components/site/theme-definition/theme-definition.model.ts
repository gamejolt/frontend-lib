import { Injectable } from '@angular/core';
import { Model, makeModel } from '../../model/model.service';

@Injectable()
export class SiteThemeDefinition extends Model
{
	key: string;
	name: string;
	description: string;
	definition: any;
	user: any;

	constructor( data?: any )
	{
		super( data );

		if ( data && data.definition ) {
			this.definition = JSON.parse( data.definition ) || {};
		}
	}
}

const deps = {};
export const provideSiteThemeDefinition = makeModel( SiteThemeDefinition, deps );
