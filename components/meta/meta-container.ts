export class MetaField
{
	original: string | null;
	current: string | null;
}

export class MetaContainer
{
	private _head: HTMLHeadElement;
	private _fields: { [key: string]: MetaField } = {};

	constructor( private _document: HTMLDocument )
	{
		this._head = this._document.head;
	}

	protected _set( name: string, content: string | null )
	{
		this._storeField( name, content );

		let elem = this._head.querySelector( `meta[name="${name}"]` ) as HTMLMetaElement;

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
		return this._fields[ name ] ? this._fields[ name ].current : null;
	}

	protected _storeField( name: string, content: string | null )
	{
		if ( !this._fields[ name ] ) {
			const field = new MetaField();

			const elem = this._head.querySelector( `meta[name="${name}"]` ) as HTMLMetaElement;
			if ( elem ) {
				field.original = elem.content;
			}

			this._fields[ name ] = field;
		}

		this._fields[ name ].current = content;
	}
}
