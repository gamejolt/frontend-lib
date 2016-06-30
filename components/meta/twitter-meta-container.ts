import { MetaContainer } from './meta-container';

export class TwitterMetaContainer extends MetaContainer
{
	// TODO: Get this working.
	shareMessage: string;

	set card( value: string ) { this._set( 'twitter:card', value ); }
	get card() { return this._get( 'twitter:card' ); }

	set title( value: string ) { this._set( 'twitter:title', value ); }
	get title() { return this._get( 'twitter:title' ); }

	set description( value: string ) { this._set( 'twitter:description', value ); }
	get description() { return this._get( 'twitter:description' ); }

	set image( value: string ) { this._set( 'twitter:image', value ); }
	get image() { return this._get( 'twitter:image' ); }

	set url( value: string ) { this._set( 'twitter:url', value ); }
	get url() { return this._get( 'twitter:url' ); }
}
