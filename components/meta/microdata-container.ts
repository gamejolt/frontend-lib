export class MicrodataContainer
{
	private head?: HTMLHeadElement;

	constructor( private document: HTMLDocument )
	{
		if ( this.document ) {
			this.head = this.document.head;
		}
	}

	set( microdata: Object )
	{
		if ( !this.head ) {
			return;
		}

		let elem = this.head.querySelector( 'script[type="application/ld+json"]' ) as HTMLScriptElement;
		if ( elem ) {
			this.clear();
		}

		elem = this.document.createElement( 'script' );
		elem.type = 'application/ld+json';
		elem.text = JSON.stringify( microdata );
		this.head.appendChild( elem );
	}

	clear()
	{
		if ( !this.head ) {
			return;
		}

		let elem = this.head.querySelector( 'script[type="application/ld+json"]' ) as HTMLScriptElement;
		if ( elem ) {
			this.head.removeChild( elem );
		}
	}
}
