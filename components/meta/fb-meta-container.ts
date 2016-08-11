import { MetaContainer } from './meta-container';

export class FbMetaContainer extends MetaContainer
{
	set title( value: string | null ) { this._set( 'og:title', value ); }
	get title() { return this._get( 'og:title' ); }

	set description( value: string | null ) { this._set( 'og:description', value ); }
	get description() { return this._get( 'og:description' ); }

	set url( value: string | null ) { this._set( 'og:url', value ); }
	get url() { return this._get( 'og:url' ); }

	set type( value: string | null ) { this._set( 'og:type', value ); }
	get type() { return this._get( 'og:type' ); }

	set image( value: string | null ) { this._set( 'og:image', value ); }
	get image() { return this._get( 'og:image' ); }

	set profileId( value: string | null ) { this._set( 'og:profile_id', value ); }
	get profileId() { return this._get( 'og:profile_id' ); }
}
