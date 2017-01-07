import { Injectable } from 'ng-metadata/core';
import { Model } from '../model/model-service';
import { SiteTheme } from './theme/theme-model';
import { SiteContentBlock } from './content-block/content-block-model';

export function SiteFactory( Model: any, SiteTheme: any, SiteContentBlock: any )
{
	return Model.create( Site, {
		SiteTheme,
		SiteContentBlock,
	} );
}

@Injectable()
export class Site extends Model
{
	static SiteTheme: typeof SiteTheme;
	static SiteContentBlock: typeof SiteContentBlock;

	static STATUS_INACTIVE = 'inactive';
	static STATUS_ACTIVE = 'active';
	static STATUS_REMOVED = 'removed';

	user: any;
	game?: any;
	theme: SiteTheme;
	content_blocks: SiteContentBlock[];
	status: string;

	constructor( data?: any )
	{
		super( data );

		if ( data && data.theme ) {
			this.theme = new Site.SiteTheme( data.theme );
		}

		if ( data && data.content_blocks ) {
			this.content_blocks = Site.SiteContentBlock.populate( data.content_blocks );
		}
	}
}
