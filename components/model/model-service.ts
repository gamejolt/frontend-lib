import { Injectable } from 'ng-metadata/core';

export function ModelFactory( $q: any, Api: any )
{
	Model.$q = $q;
	Model.Api = Api;

	return Model;
}

@Injectable()
export class Model
{
	id: number;
	_removed: boolean;

	static $q: angular.IQService;
	static Api: any;

	// We need to create some methods dynamically on the model.
	static populate: ( rows: any[] ) => any[];
	assign: ( other: any ) => void;

	static create( self: any, injections?: any )
	{
		// These need to be created dynamically for each model type.
		self.populate = function( rows: any[] ): any[]
		{
			const models: any[] = [];
			if ( rows && angular.isArray( rows ) && rows.length ) {
				for ( const row of rows ) {
					models.push( new self( row ) );
				}
			}
			return models;
		};

		self.prototype.assign = function( other: any )
		{
			// Some times the model constructors add new fields when populating.
			// This way we retain those fields.
			const newObj = new self( other );
			angular.extend( this, newObj );
		};

		angular.extend( self.prototype, Model.prototype );

		// This will allow you to inject angular services statically so that the models
		// have access to those services.
		if ( injections ) {
			for ( let injectionName in injections ) {
				self[ injectionName ] = injections[ injectionName ];
			}
		}

		return self;
	}

	/**
	 * You can call this after an API call that created a model.
	 * Will handle the error response and return the newly created model.
	 */
	static processCreate( response: any, field: string )
	{
		if ( response.success && response[ field ] ) {
			return Model.$q.resolve( response );
		}
		return Model.$q.reject( response );
	}

	constructor( data?: any )
	{
		if ( data ) {
			angular.extend( this, data );
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
			return Model.$q.resolve( response );
		}
		return Model.$q.reject( response );
	}

	/**
	 * You can call this after an API call that removed the model.
	 * Will handle error codes.
	 */
	processRemove( response: any )
	{
		if ( response.success ) {
			this._removed = true;
			return Model.$q.resolve( response );
		}
		return Model.$q.reject( response );
	}

	$_save( url: string, field: string, options?: any ): angular.IPromise<any>
	{
		return Model.Api.sendRequest( url, this, options )
			.then( ( response: any ) => this.processUpdate( response, field ) );
	}

	$_remove( url: string, options?: any ): angular.IPromise<any>
	{
		// Always force a POST (passing in an object).
		return Model.Api.sendRequest( url, {}, options )
			.then( ( response: any ) => this.processRemove( response ) );
	}
}
