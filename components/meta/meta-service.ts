import { Injectable, Inject } from 'ng-metadata/core';
import { MetaContainer } from './meta-container';
import { FbMetaContainer } from './fb-meta-container';
import { TwitterMetaContainer } from './twitter-meta-container';

@Injectable()
export class Meta extends MetaContainer
{
	private _fb: FbMetaContainer;
	private _twitter: TwitterMetaContainer;
	private _originalTitle: string;

	constructor(
		@Inject( '$rootScope' ) $rootScope: angular.IRootScopeService,
		@Inject( '$window' ) private $window: angular.IWindowService,
		@Inject( '$document' ) private $document: angular.IDocumentService,
		@Inject( 'Environment' ) private Environment: any
	)
	{
		super( $document[0] );

		this._originalTitle = this.title;
		this._fb = new FbMetaContainer( this.$document[0] );
		this._twitter = new TwitterMetaContainer( this.$document[0] );

		this.clear();

		$rootScope.$on( '$stateChangeSuccess', () =>
		{
			this.clear();
		} );
	}

	set title( title: string )
	{
		if ( title ) {
			if ( this.Environment.isClient ) {
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

	set description( value: string ) { this._set( 'description', value ); }
	get description() { return this._get( 'description' ); }

	set redirect( value: string ) { this._set( 'redirect', value ); }
	get redirect() { return this._get( 'redirect' ); }

	set responseCode( value: string ) { this._set( 'responseCode', value ); }
	get responseCode() { return this._get( 'responseCode' ); }

	set fb( values: Object )
	{
		for ( const i in values ) {
			this._fb[ i ] = values[ i ];
		}
	}

	get fb() { return this._fb; }

	set twitter( values: Object )
	{
		for ( const i in values ) {
			this._twitter[ i ] = values[ i ];
		}
	}

	get twitter() { return this._twitter; }

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
	}
}
