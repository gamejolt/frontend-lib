export class MetaField
{
	original: string;
	current: string;
}

export class MetaContainer
{
	private _head: HTMLHeadElement;
	private _fields: { [key: string]: MetaField } = {};

	constructor( private _document: HTMLDocument )
	{
		this._head = this._document.head;
	}

	protected _set( name: string, content: string )
	{
		this._storeField( name, content );

		let elem = <HTMLMetaElement>this._head.querySelector( `meta[name="${name}"]` );

		// Remove if we're nulling it out.
		if ( !content ) {
			if ( elem ) {
				this._head.removeChild( elem );
			}
			return;
		}

		// Create if not exists.
		if ( !elem ) {
			elem = this._document.createElement( 'meta' );
			elem.name = name;
			this._head.appendChild( elem );
		}

		elem.content = content;
	}

	protected _get( name: string )
	{
		return this._fields[ name ] ? this._fields[ name ].current : undefined;
	}

	protected _storeField( name: string, content: string )
	{
		if ( !this._fields[ name ] ) {
			const field = new MetaField();

			const elem = <HTMLMetaElement>this._head.querySelector( `meta[name="${name}"]` );
			if ( elem ) {
				field.original = elem.content;
			}

			this._fields[ name ] = field;
		}

		this._fields[ name ].current = content;
	}
}
