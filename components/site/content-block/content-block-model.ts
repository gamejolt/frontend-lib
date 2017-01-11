import { Injectable } from 'ng-metadata/core';
import { Model } from '../../model/model-service';

export function SiteContentBlockFactory( Model: any )
{
	return Model.create( SiteContentBlock, {
	} );
}

@Injectable()
export class SiteContentBlock extends Model
{
	content_markdown: string;
	content_compiled: string;
}
