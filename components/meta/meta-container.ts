import { Meta as ngMeta } from '@angular/platform-browser';

export class MetaField
{
	original: string | null;
	current: string | null;
}

export class MetaContainer
{
	private _fields: { [key: string]: MetaField } = {};

	constructor( private ngMetaService: ngMeta )
	{
	}

	protected _set( name: string, content: string | null )
	{
		this._storeField( name, content );

		let elem = this.ngMetaService.getTag( `name="${name}"` );

		// Remove if we're nulling it out.
		if ( !content ) {
			if ( elem ) {
				this.ngMetaService.removeTagElement( elem );
			}
			return;
		}

		// Upsert.
		if ( !elem ) {
			elem = this.ngMetaService.addTag( {
				name,
				content,
			} );
		}
		else {
			this.ngMetaService.updateTag( {
				name,
				content,
			} );
		}
	}

	protected _get( name: string )
	{
		return this._fields[ name ] ? this._fields[ name ].current : null;
	}

	protected _storeField( name: string, content: string | null )
	{
		if ( !this._fields[ name ] ) {
			const field = new MetaField();

			const elem = this.ngMetaService.getTag( `name="${name}"` );
			if ( elem ) {
				field.original = elem.content;
			}

			this._fields[ name ] = field;
		}

		this._fields[ name ].current = content;
	}
}
