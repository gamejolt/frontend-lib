import { Model } from '../model/model.service';
import { SiteTheme } from './theme/theme-model';
import { SiteContentBlock } from './content-block/content-block-model';

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
	}
}

Model.create( Site );
