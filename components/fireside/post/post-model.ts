import { Injectable } from 'ng-metadata/core';
import { Model } from './../../model/model';
import { Fireside_Post_Tag } from './tag/tag-model';

export function Fireside_PostFactory( Environment, Model, Fireside_Post_Tag, MediaItem )
{
	return Model.create( Fireside_Post, {
		Environment,
		Fireside_Post_Tag,
		MediaItem,
	} );
}

@Injectable()
export class Fireside_Post extends Model
{
	hash: string;
	title: string;
	lead: string;
	// header: gj.MediaItem;
	header: any;
	status: string;
	added_on: number;
	updated_on: number;
	published_on: number;
	like_count: number;
	// user: gj.User;
	user: any;
	game_id: number;
	slug: string;
	// tags: gj.Fireside_Post_Tag[];
	tags: any[];
	subline: string;
	content: string;
	compiled_content: string;

	url: string;

	// For uploads.
	file: any;

	static Environment: any;
	static Fireside_Post_Tag: typeof Fireside_Post_Tag;
	static MediaItem: any;

	static TYPE_TEXT = 'text';

	static STATUS_DRAFT = 'draft';
	static STATUS_ACTIVE = 'active';
	static STATUS_REMOVED = 'removed';

	constructor( data?: any )
	{
		super( data );

		if ( this.header && angular.isObject( this.header ) ) {
			this.header = new Fireside_Post.MediaItem( this.header );
		}

		if ( this.tags && angular.isArray( this.tags ) && this.tags.length ) {
			this.tags = Fireside_Post.Fireside_Post_Tag.populate( this.tags );
		}

		this.url = Fireside_Post.Environment.firesideBaseUrl + '/post/' + this.slug;
	}

	static pullHashFromUrl( url: string )
	{
		return url.substring( url.lastIndexOf( '-' ) + 1 );
	}

	$save()
	{
		if ( Fireside_Post.Environment.isWttf ) {
			if ( !this.id ) {
				return this.$_save( '/web/dash/developer/games/devlog/save/' + this.game_id, 'firesidePost', { file: this.file } );
			}
			else {
				return this.$_save( '/web/dash/developer/games/devlog/save/' + this.game_id + '/' + this.id, 'firesidePost', { file: this.file } );
			}
		}
		else {
			if ( !this.id ) {
				return this.$_save( '/fireside/dash/posts/add', 'firesidePost' );
			}
			else {
				return this.$_save( '/fireside/dash/posts/save/' + this.id, 'firesidePost' );
			}
		}
	}

	$clearHeader()
	{
		return this.$_save( '/fireside/dash/posts/clear-header/' + this.id, 'firesidePost' );
	}

	$remove()
	{
		return this.$_remove( '/fireside/dash/posts/remove/' + this.id );
	}
}
