import { Injectable, Inject } from 'ng-metadata/core';
import { MetaContainer } from './meta-container';
import { FbMetaContainer } from './fb-meta-container';
import { TwitterMetaContainer } from './twitter-meta-container';
import { MicrodataContainer } from './microdata-container';

@Injectable( 'Meta' )
export class Meta extends MetaContainer
{
	private _fb: FbMetaContainer;
	private _twitter: TwitterMetaContainer;
	private _originalTitle: string;
	private _microdata: MicrodataContainer;

	constructor(
		@Inject( '$rootScope' ) $rootScope: ng.IRootScopeService,
		@Inject( '$document' ) private $document: ng.IDocumentService,
	)
	{
		super( window.document );

		this._originalTitle = window.document.title;
		this._fb = new FbMetaContainer( window.document );
		this._twitter = new TwitterMetaContainer( window.document );
		this._microdata = new MicrodataContainer( window.document );

		this.clear();

		$rootScope.$on( '$stateChangeSuccess', () =>
		{
			this.clear();
		} );
	}

	set title( title: string | null )
	{
		if ( title ) {
			if ( GJ_IS_CLIENT ) {
				title += ' - Game Jolt';
			}
			else {
				title += ' on Game Jolt';
			}
		}
		else {
			title = this._originalTitle;
		}

		this.$document[ 0 ].title = title;
	}

	get title() { return this.$document[0].title; }

	set description( value: string | null ) { this._set( 'description', value ); }
	get description() { return this._get( 'description' ); }

	set redirect( value: string | null ) { this._set( 'redirect', value ); }
	get redirect() { return this._get( 'redirect' ); }

	set responseCode( value: string | null ) { this._set( 'responseCode', value ); }
	get responseCode() { return this._get( 'responseCode' ); }

	set fb( values: any )
	{
		angular.merge( this._fb, values );
	}

	get fb() { return this._fb; }

	set twitter( values: any )
	{
		angular.merge( this._twitter, values );
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
