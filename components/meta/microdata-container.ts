export class MicrodataContainer
{
	private _head: HTMLHeadElement;

	constructor( private _document: HTMLDocument )
	{
		this._head = this._document.head;
	}

	set( microdata: Object )
	{
		let elem = this._head.querySelector( 'script[type="application/ld+json"]' ) as HTMLScriptElement;
		if ( elem ) {
			this.clear();
		}

		elem = this._document.createElement( 'script' );
		elem.type = 'application/ld+json';
		elem.text = JSON.stringify( microdata );
		this._head.appendChild( elem );
	}

	clear()
	{
		let elem = this._head.querySelector( 'script[type="application/ld+json"]' ) as HTMLScriptElement;
		if ( elem ) {
			this._head.removeChild( elem );
		}
	}
}
