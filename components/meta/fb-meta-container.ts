import { MetaContainer } from './meta-container';

export class FbMetaContainer extends MetaContainer
{
	set title( value: string ) { this._set( 'og:title', value ); }
	get title() { return this._get( 'og:title' ); }

	set description( value: string ) { this._set( 'og:description', value ); }
	get description() { return this._get( 'og:description' ); }

	set url( value: string ) { this._set( 'og:url', value ); }
	get url() { return this._get( 'og:url' ); }

	set type( value: string ) { this._set( 'og:type', value ); }
	get type() { return this._get( 'og:type' ); }

	set image( value: string ) { this._set( 'og:type', value ); }
	get image() { return this._get( 'og:type' ); }

	set profileId( value: string ) { this._set( 'og:profile_id', value ); }
	get profileId() { return this._get( 'og:profile_id' ); }
}