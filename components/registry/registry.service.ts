export class RegistryItemConfig
{
	constructor( public maxItems = 0 ) { }
}

export class Registry
{
	static config: { [k: string]: RegistryItemConfig } = {};
	static items: { [k: string ]: any[] } = {};

	static setConfig( type: string, config: RegistryItemConfig )
	{
		this.config[ type ] = config;
	}

	static store( type: string, newItems: any[] | any )
	{
		if ( typeof this.config[ type ] === 'undefined' ) {
			this.config[ type ] = new RegistryItemConfig();
		}

		if ( typeof this.items[ type ] === 'undefined' ) {
			this.items[ type ] = [];
		}

		if ( !Array.isArray( newItems ) ) {
			newItems = [ newItems ];
		}

		this.items[ type ] = this.items[ type ].concat( newItems );
		this.items[ type ] = this.items[ type ].slice( -this.config[ type ].maxItems );
	}

	static find( type: string, id: string | number )
	{
		if ( typeof this.items[ type ] === 'undefined' ) {
			this.items[ type ] = [];
		}

		if ( typeof id === 'string' ) {
			id = parseInt( id, 10 );
		}

		// Reverse search.
		for ( let i = this.items[ type ].length - 1; i >= 0; --i ) {
			const item = this.items[ type ][ i ];
			if ( item.id === id ) {
				return item;
			}
		}

		return undefined;
	}
}
