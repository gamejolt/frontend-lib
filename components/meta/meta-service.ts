import { MetaContainer } from './meta-container';
import { FbMetaContainer } from './fb-meta-container';
import { TwitterMetaContainer } from './twitter-meta-container';
import { MicrodataContainer } from './microdata-container';

export class Meta extends MetaContainer
{
	private static _originalTitle = window.document.title;
	private static _fb = FbMetaContainer;
	private static _twitter = TwitterMetaContainer;
	private static _microdata = MicrodataContainer;

	static initAngular( $rootScope: any )
	{
		$rootScope.$on( '$stateChangeSuccess', () =>
		{
			this.clear();
		} );
	}

	static set title( title: string | null )
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

		window.document.title = title;
	}

	static get title() { return window.document.title; }

	static set description( value: string | null ) { this._set( 'description', value ); }
	static get description() { return this._get( 'description' ); }

	static set redirect( value: string | null ) { this._set( 'redirect', value ); }
	static get redirect() { return this._get( 'redirect' ); }

	static set responseCode( value: string | null ) { this._set( 'responseCode', value ); }
	static get responseCode() { return this._get( 'responseCode' ); }

	static set fb( values: any )
	{
		Object.assign( this._fb, values );
	}

	static get fb() { return this._fb; }

	static set twitter( values: any )
	{
		Object.assign( this._twitter, values );
	}

	static get twitter() { return this._twitter; }

	static set microdata( microdata: Object )
	{
		this._microdata.set( microdata );
	}

	static clear()
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
