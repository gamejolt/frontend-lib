import { Injectable } from '@angular/core';
import { Model } from './../../model/model-service';
import { Fireside_Post_Tag } from './tag/tag-model';
import { Fireside_Post_Like } from './like/like-model';
import { Fireside_Post_Video } from './video/video-model';
import { ModalConfirm } from './../../modal/confirm/confirm-service';
import { App } from './../../../../../app/app-service';
import { HistoryTick } from './../../history-tick/history-tick-service';

export function Fireside_PostFactory(
	Model: any,
	App: any,
	Api: any,
	Environment: any,
	Game: any,
	Fireside_Post_Tag: any,
	Fireside_Post_Like: any,
	Fireside_Post_Video: any,
	MediaItem: any,
	ModalConfirm: any,
	HistoryTick: any,
	gettextCatalog: any,
)
{
	return Model.create( Fireside_Post, {
		App,
		Api,
		Environment,
		Game,
		Fireside_Post_Tag,
		Fireside_Post_Like,
		Fireside_Post_Video,
		MediaItem,
		ModalConfirm,
		HistoryTick,
		gettextCatalog,
	} );
}

@Injectable()
export class Fireside_Post extends Model
{
	static App: App;
	static Api: any;
	static Environment: any;
	static Game: any;
	static Fireside_Post_Tag: typeof Fireside_Post_Tag;
	static Fireside_Post_Like: typeof Fireside_Post_Like;
	static Fireside_Post_Video: typeof Fireside_Post_Video;
	static MediaItem: any;
	static ModalConfirm: ModalConfirm;
	static HistoryTick: HistoryTick;
	static gettextCatalog: ng.gettext.gettextCatalog;

	static TYPE_TEXT = 'text';
	static TYPE_MEDIA = 'media';
	static TYPE_VIDEO = 'video';

	static STATUS_DRAFT = 'draft';
	static STATUS_ACTIVE = 'active';
	static STATUS_REMOVED = 'removed';

	type: 'text' | 'media' | 'video';
	hash: string;
	title: string;
	lead: string;
	header: any;
	status: string;
	added_on: number;
	updated_on: number;
	published_on: number;
	like_count: number;
	comment_count: number;
	user: any;
	game: any;
	slug: string;
	subline: string;
	content_compiled: string;
	content_markdown: string;
	view_count?: number;
	expand_count?: number;

	tags: Fireside_Post_Tag[] = [];
	media: any[] = [];
	videos: Fireside_Post_Video[] = [];
	user_like: Fireside_Post_Like | null;

	url: string;

	// For feeds.
	scroll_id?: string;

	// For uploads.
	file: any;

	constructor( data?: any )
	{
		super( data );

		if ( data && data.header ) {
			this.header = new Fireside_Post.MediaItem( data.header );
		}

		if ( data && data.game ) {
			this.game = new Fireside_Post.Game( data.game );
		}

		if ( data && data.tags ) {
			this.tags = Fireside_Post.Fireside_Post_Tag.populate( data.tags );
		}

		if ( data && data.media ) {
			this.media = Fireside_Post.MediaItem.populate( data.media );
		}

		if ( data && data.videos ) {
			this.videos = Fireside_Post.Fireside_Post_Video.populate( data.videos );
		}

		if ( data && data.user_like ) {
			this.user_like = new Fireside_Post.Fireside_Post_Like( data.user_like );
		}

		this.url = Fireside_Post.Environment.firesideBaseUrl + '/post/' + this.slug;
	}

	static pullHashFromUrl( url: string )
	{
		return url.substring( url.lastIndexOf( '-' ) + 1 );
	}

	fetchLikes(): ng.IPromise<Fireside_Post_Like[]>
	{
		return Fireside_Post.Api.sendRequest( `/fireside/posts/likes/${this.id}` )
			.then( ( response: any ) =>
			{
				return Fireside_Post.Fireside_Post_Like.populate( response.likes );
			} );
	}

	$save()
	{
		if ( this.game ) {
			const options = {
				allowComplexData: [ 'keyGroups' ],
				file: this.file,
			};

			if ( !this.id ) {
				return this.$_save( `/web/dash/developer/games/devlog/save/${this.game.id}`, 'firesidePost', options );
			}
			else {
				return this.$_save( `/web/dash/developer/games/devlog/save/${this.game.id}/${this.id}`, 'firesidePost', options );
			}
		}
		else {
			if ( !this.id ) {
				return this.$_save( '/fireside/dash/posts/add', 'firesidePost' );
			}
			else {
				return this.$_save( `/fireside/dash/posts/save/${this.id}`, 'firesidePost' );
			}
		}
	}

	$viewed()
	{
		if ( !Fireside_Post.App.user || this.user.id != Fireside_Post.App.user.id ) {
			Fireside_Post.HistoryTick.sendBeacon( 'fireside-post', this.id );
		}
	}

	$expanded()
	{
		if ( !Fireside_Post.App.user || this.user.id != Fireside_Post.App.user.id ) {
			Fireside_Post.HistoryTick.sendBeacon( 'fireside-post-expand', this.id );
		}
	}

	$clearHeader()
	{
		return this.$_save( `/fireside/dash/posts/clear-header/${this.id}`, 'firesidePost' );
	}

	$publish()
	{
		if ( this.game ) {
			return this.$_save( `/web/dash/developer/games/devlog/publish/${this.game.id}/${this.id}`, 'firesidePost' );
		}

		throw new Error( 'Must be attached to a game to publish.' );
	}

	remove()
	{
		return Fireside_Post.ModalConfirm.show(
			Fireside_Post.gettextCatalog.getString( 'Are you sure you want to remove this post?' ),
			undefined,
			'yes'
		)
		.then( () =>
		{
			return this.$remove();
		} );
	}

	$remove()
	{
		if ( this.game ) {
			return this.$_remove( `/web/dash/developer/games/devlog/remove/${this.game.id}/${this.id}` );
		}
		else {
			return this.$_remove( `/fireside/dash/posts/remove/${this.id}` );
		}
	}
}
