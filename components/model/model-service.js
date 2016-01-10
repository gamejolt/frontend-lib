angular.module( 'gj.Model' ).factory( 'Model', function( $q, Api )
{
	var Model = {};

	Model.create = function( constructor )
	{
		constructor.populate = function( rows )
		{
			var models = [];
			if ( rows && angular.isArray( rows ) && rows.length ) {
				for ( var i = 0; i < rows.length; ++i ) {
					models.push( new constructor( rows[i] ) );
				}
			}
			return models;
		};

		/**
		 * You can call this after an API call that created a model.
		 * Will handle the error response and return the newly created model.
		 * @param {object} response
		 * @param {string} field The field name of the new model data. Example: 'jam'
		 * @return {promise}
		 */
		constructor.processCreate = function( response, field )
		{
			var deferred = $q.defer();
			if ( response.success && response[field] ) {
				deferred.resolve( response );
			}
			else {
				deferred.reject( response );
			}

			return deferred.promise;
		};

		constructor.prototype.assign = function( other )
		{
			// Some times the model constructors add new fields when populating.
			// This way we retain those fields.
			var newObj = new constructor( other );
			angular.extend( this, newObj );
		};

		/**
		 * You can call this after an API call that updated the model.
		 * Will pull in the new values for the model as well as handling the error response.
		 * @param {object} response
		 * @param {string} field The field name of the new model data. Example: 'jam'
		 * @return {promise}
		 */
		constructor.prototype.processUpdate = function( response, field )
		{
			var deferred = $q.defer();
			if ( response.success && response[field] ) {

				this.assign( response[field] );
				deferred.resolve( response );
			}
			else {
				deferred.reject( response );
			}

			return deferred.promise;
		};

		/**
		 * You can call this after an API call that removed the model.
		 * Will handle error codes.
		 * @param {object} response
		 * @return {promise}
		 */
		constructor.prototype.processRemove = function( response )
		{
			var deferred = $q.defer();
			if ( response.success ) {
				this._removed = true;
				deferred.resolve( response );
			}
			else {
				deferred.reject( response );
			}

			return deferred.promise;
		};

		constructor.prototype.$_save = function( url, field, options )
		{
			var _this = this;

			// Pass in "this" as the request data.
			return Api.sendRequest( url, this, options )
				.then( function( response )
				{
					return _this.processUpdate( response, field );
				} );
		};

		constructor.prototype.$_remove = function( url, options )
		{
			var _this = this;

			// Always force a POST (passing in an object).
			return Api.sendRequest( url, {}, options )
				.then( function( response )
				{
					return _this.processRemove( response );
				} );
		};

		return constructor;
	};

	return Model;
} );
