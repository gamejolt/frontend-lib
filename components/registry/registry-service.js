angular.module( 'gj.Registry' ).service( 'Registry', function()
{
	var config = {};
	var items = {};

	this.setConfig = function( type, _config )
	{
		config[ type ] = _config;
	};

	this.store = function( type, newItems )
	{
		if ( angular.isUndefined( items[ type ] ) ) {
			items[ type ] = [];
		}

		if ( !angular.isArray( newItems ) ) {
			newItems = [ newItems ];
		}

		items[ type ] = items[ type ].concat( newItems );
		items[ type ] = items[ type ].slice( -config[ type ].maxItems );
	};

	this.find = function( type, id )
	{
		if ( angular.isUndefined( items[ type ] ) ) {
			items[ type ] = [];
		}

		if ( angular.isString( id ) ) {
			id = parseInt( id, 10 );
		}

		return _.findLast( items[ type ], { id: id } );
	};
} );
