import { Api } from '../api/api';

export class Model
{
	id: number;
	_removed: boolean;

	// We need to create some methods dynamically on the model.
	static populate: ( rows: any[] ) => any[];
	assign: ( other: any ) => void;

	static init( self: any )
	{
		// These need to be created dynamically for each model type.
		self.populate = function( rows: any[] ): any[]
		{
			const models: any[] = [];
			if ( rows && Array.isArray( rows ) && rows.length ) {
				for ( const row of rows ) {
					models.push( new self( row ) );
				}
			}
			return models;
		};

		self.prototype.assign = function( this: any, other: any )
		{
			// Some times the model constructors add new fields when populating.
			// This way we retain those fields.
			const newObj = new self( other );
			Object.assign( this, newObj );
		};

		Object.assign( self.prototype, Model.prototype );

		return self;
	}

	/**
	 * You can call this after an API call that created a model.
	 * Will handle the error response and return the newly created model.
	 */
	static processCreate( response: any, field: string )
	{
		if ( response.success && response[ field ] ) {
			return Promise.resolve( response );
		}
		return Promise.reject( response );
	}

	constructor( data?: any )
	{
		if ( data ) {
			Object.assign( this, data );
		}
	}

	/**
	 * You can call this after an API call that updated the model.
	 * Will pull in the new values for the model as well as handling the error response.
	 */
	processUpdate( response: any, field: string )
	{
		if ( response.success && response[ field ] ) {
			this.assign( response[ field ] );
			return Promise.resolve( response );
		}
		return Promise.reject( response );
	}

	/**
	 * You can call this after an API call that removed the model.
	 * Will handle error codes.
	 */
	processRemove( response: any )
	{
		if ( response.success ) {
			this._removed = true;
			return Promise.resolve( response );
		}
		return Promise.reject( response );
	}

	async $_save( url: string, field: string, options?: any ): Promise<any>
	{
		const response = Api.sendRequest( url, this, options )
		return this.processUpdate( response, field );
	}

	async $_remove( url: string, options?: any ): Promise<any>
	{
		// Always force a POST (passing in an object).
		const response = Api.sendRequest( url, {}, options );
		return this.processRemove( response );
	}
}
