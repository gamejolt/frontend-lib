import { Injectable } from '@angular/core';
import { Model, makeModel } from '../../model/model.service';

@Injectable()
export class SiteContentBlock extends Model
{
	content_markdown: string;
	content_compiled: string;
}

const deps = {};
export const provideSiteContentBlock = makeModel( SiteContentBlock, deps );
