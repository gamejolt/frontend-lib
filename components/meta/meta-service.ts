import { Injectable, Inject } from '@angular/core';
import { Title, Meta as ngMeta, DOCUMENT } from '@angular/platform-browser';

import { Environment } from '../environment/environment.service';
import { MetaContainer } from './meta-container';
import { FbMetaContainer } from './fb-meta-container';
import { TwitterMetaContainer } from './twitter-meta-container';
import { MicrodataContainer } from './microdata-container';

@Injectable()
export class Meta extends MetaContainer
{
	private _fb: FbMetaContainer;
	private _twitter: TwitterMetaContainer;
	private _originalTitle: string;
	private _microdata: MicrodataContainer;

	constructor(
		@Inject( DOCUMENT ) document: HTMLDocument,
		ngMetaService: ngMeta,
		private titleService: Title,
		private env: Environment,
	)
	{
		super( ngMetaService );

		this._originalTitle = this.titleService.getTitle();
		this._fb = new FbMetaContainer( ngMetaService );
		this._twitter = new TwitterMetaContainer( ngMetaService );
		this._microdata = new MicrodataContainer( document );

		this.clear();

		// TODO: Figure out new way with ui-router.
		// $rootScope.$on( '$stateChangeSuccess', () =>
		// {
		// 	this.clear();
		// } );
	}

	set title( title: string | null )
	{
		if ( title ) {
			if ( this.env.isClient ) {
				title += ' - Game Jolt';
			}
			else {
				title += ' on Game Jolt';
			}
		}
		else {
			title = this._originalTitle;
		}

		this.titleService.setTitle( title );
	}

	get title() { return this.titleService.getTitle(); }

	set description( value: string | null ) { this._set( 'description', value ); }
	get description() { return this._get( 'description' ); }

	set redirect( value: string | null ) { this._set( 'redirect', value ); }
	get redirect() { return this._get( 'redirect' ); }

	set responseCode( value: string | null ) { this._set( 'responseCode', value ); }
	get responseCode() { return this._get( 'responseCode' ); }

	set fb( values: any )
	{
		Object.assign( this._fb, values );
	}

	get fb() { return this._fb; }

	set twitter( values: any )
	{
		Object.assign( this._twitter, values );
	}

	get twitter() { return this._twitter; }

	set microdata( microdata: Object )
	{
		this._microdata.set( microdata );
	}

	clear()
	{
		this.description = null;
		this.redirect = null;
		this.responseCode = null;

		this.fb = {
			title: null,
			description: null,
			url: null,
			type: null,
			image: null,
			profileId: null,
		};

		this.twitter = {
			title: null,
			description: null,
			card: null,
			image: null,
			url: null,
			shareMessage: null,
		};

		this._microdata.clear();
	}
}
