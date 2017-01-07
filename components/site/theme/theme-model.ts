import { Injectable } from 'ng-metadata/core';
import { Model } from '../../model/model-service';
import { SiteTemplate } from '../template/template-model';

export function SiteThemeFactory( Model: any, SiteTemplate: any )
{
	return Model.create( SiteTheme, {
		SiteTemplate,
	} );
}

@Injectable()
export class SiteTheme extends Model
{
	static SiteTemplate: typeof SiteTemplate;

	template: SiteTemplate;
	data: any;

	constructor( data?: any )
	{
		super( data );

		if ( data && data.template ) {
			this.template = new SiteTheme.SiteTemplate( data.template );
		}

		if ( data && data.data ) {
			this.data = JSON.parse( data.data ) || {};
		}
	}
}
