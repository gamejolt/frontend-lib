import { Injectable } from '@angular/core';
import { Model, makeModel } from '../../model/model.service';
import { SiteThemeDefinition } from '../theme-definition/theme-definition.model';

@Injectable()
export class SiteTheme extends Model
{
	static SiteThemeDefinition: typeof SiteThemeDefinition;

	definition: SiteThemeDefinition;
	theme: any;

	constructor( data?: any )
	{
		super( data );

		if ( data && data.definition ) {
			this.definition = new SiteTheme.SiteThemeDefinition( data.definition );
		}

		if ( data && data.theme ) {
			this.theme = JSON.parse( data.theme ) || {};
		}
	}
}

const deps = { SiteThemeDefinition };
export const provideSiteTheme = makeModel( SiteTheme, deps );
