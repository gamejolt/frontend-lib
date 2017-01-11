import { Injectable } from 'ng-metadata/core';
import { Model } from './../../../model/model-service';

export function Fireside_Post_SketchfabFactory( Model: any )
{
	return Model.create( Fireside_Post_Sketchfab, {
	} );
}

@Injectable()
export class Fireside_Post_Sketchfab extends Model
{
	fireside_post_id: number;
	sketchfab_id: string;
	thumbnail_url: string;
}
