import { MetaContainer } from './meta-container';

export class FbMetaContainer extends MetaContainer
{
	static set title( value: string | null ) { this._set( 'og:title', value ); }
	static get title() { return this._get( 'og:title' ); }

	static set description( value: string | null ) { this._set( 'og:description', value ); }
	static get description() { return this._get( 'og:description' ); }

	static set url( value: string | null ) { this._set( 'og:url', value ); }
	static get url() { return this._get( 'og:url' ); }

	static set type( value: string | null ) { this._set( 'og:type', value ); }
	static get type() { return this._get( 'og:type' ); }

	static set image( value: string | null ) { this._set( 'og:image', value ); }
	static get image() { return this._get( 'og:image' ); }

	static set profileId( value: string | null ) { this._set( 'og:profile_id', value ); }
	static get profileId() { return this._get( 'og:profile_id' ); }
}
