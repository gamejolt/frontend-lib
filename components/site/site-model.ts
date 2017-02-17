import { Model } from '../model/model.service';
import { SiteTheme } from './theme/theme-model';
import { SiteContentBlock } from './content-block/content-block-model';
import { SiteBuild } from './build/build-model';

export class Site extends Model
{
	static STATUS_INACTIVE = 'inactive';
	static STATUS_ACTIVE = 'active';
	static STATUS_REMOVED = 'removed';

	url: string;
	user: any;
	game?: any;
	theme: SiteTheme;
	content_blocks: SiteContentBlock[];
	is_static: boolean;
	build?: SiteBuild;
	status: string;

	constructor( data: any = {} )
	{
		super( data );

		if ( data.theme ) {
			this.theme = new SiteTheme( data.theme );
		}

		if ( data.content_blocks ) {
			this.content_blocks = SiteContentBlock.populate( data.content_blocks );
		}

		if ( data.build ) {
			this.build = new SiteBuild( data.build );
		}
	}
}

Model.create( Site );
