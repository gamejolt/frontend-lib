angular.module( 'gj.LinkedKey' ).factory( 'LinkedKey', function( Model )
{
	function LinkedKey( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}
	}

	LinkedKey.prototype.$remove = function( )
	{
		return this.$_remove( '/web/dash/developer/games/linked-keys/remove/' + this.id );
	};

	return Model.create( LinkedKey );
} );
