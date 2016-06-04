angular.module( 'gj.Key' ).factory( 'Key', function( Model )
{
	function Key( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}
	}

	Key.prototype.$remove = function()
	{
		return this.$_remove( '/web/dash/developer/games/keys/remove/' + this.id );
	};

	return Model.create( Key );
} );
